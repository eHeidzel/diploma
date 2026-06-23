import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './modules/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { join } from 'path';

// Кэшируем инстанс Express, чтобы NestJS не пересоздавался при каждом Serverless-запросе
let cachedExpressApp: any;

async function bootstrap() {
  if (cachedExpressApp) {
    return cachedExpressApp;
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Настройка статических файлов
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Настройка CORS для Vercel
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'https://codezone1.vercel.app',
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.VERCEL_BRANCH_URL
      ? `https://${process.env.VERCEL_BRANCH_URL}`
      : null,
    /\.vercel\.app$/,
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isAllowed = allowedOrigins.some((allowed) => {
        if (typeof allowed === 'string') {
          return origin === allowed;
        }
        if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return false;
      });

      if (process.env.NODE_ENV === 'production') {
        callback(null, true);
        return;
      }

      callback(null, isAllowed);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
  });

  // ВАЖНО ДЛЯ VERCEL: Явно задаем префикс, так как роуты в vercel.json ведут на /api
  app.setGlobalPrefix('api');

  // Инициализируем модули NestJS (включая TypeORM подключение)
  await app.init();

  // Логирование переменных окружения (теперь они гарантированно попадут в Runtime Logs)
  Logger.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('ПОРТ БАЗЫ ДАННЫХ ИЗ ОКРУЖЕНИЯ VERCEL:', process.env.DB_PORT);
  console.log('ХОСТ БАЗЫ ДАННЫХ ИЗ ОКРУЖЕНИЯ VERCEL:', process.env.DB_HOST);

  // Извлекаем чистый инстанс Express сервера для прослойки Vercel
  cachedExpressApp = app.getHttpAdapter().getInstance();
  return cachedExpressApp;
}

// ЭКСПОРТ ДЛЯ VERCEL (Serverless функция)
// Когда Vercel получает запрос, он вызывает эту дефолтную функцию
export default async (req: any, res: any) => {
  const server = await bootstrap();
  return server(req, res);
};

// РЕЖИМ ДЛЯ ЛОКАЛЬНОГО ЗАПУСКА (Запустится только на вашем ПК через npm run start)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  async function localLaunch() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    
    // Дублируем базовые локальные настройки
    app.setGlobalPrefix('api');
    app.enableCors({ origin: true, credentials: true });
    
    const port = process.env.PORT || 8080;
    await app.listen(port);
    
    Logger.log(`🚀 Локальное приложение запущено на порту ${port}`);
  }
  localLaunch();
}
