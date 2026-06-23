import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './modules/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
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

      // В production разрешаем все запросы, чтобы избежать проблем
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

  // Используем порт из переменных окружения
  const port = process.env.PORT || 8080;
  await app.listen(port);

  Logger.log(`🚀 Application is running on port ${port}`);
  Logger.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);

  console.log('ПОРТ БАЗЫ ДАННЫХ ИЗ ОКРУЖЕНИЯ VERCEL:', process.env.DB_PORT);
  console.log('ХОСТ БАЗЫ ДАННЫХ ИЗ ОКРУЖЕНИЯ VERCEL:', process.env.DB_HOST);
}

bootstrap();
