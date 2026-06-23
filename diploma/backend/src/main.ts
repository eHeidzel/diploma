import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './modules/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Настройка статических файлов для загрузок
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // НАСТРОЙКА ДЛЯ ФРОНТЕНДА:
  // Раздаем статические файлы фронтенда (если они есть)
  const frontendDistPath = join(__dirname, '..', '..', 'frontend', 'dist');
  app.useStaticAssets(frontendDistPath);
  
  // Для SPA - обрабатываем все маршруты, кроме API
  const express = app.getHttpAdapter().getInstance();
  express.get('*', (req, res, next) => {
    // Если запрос начинается с /api или /uploads - пропускаем
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    // Если запрос на статический файл - пропускаем
    if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|json)$/)) {
      return next();
    }
    // Все остальные запросы отправляем на index.html фронтенда
    try {
      res.sendFile(join(frontendDistPath, 'index.html'));
    } catch (error) {
      next();
    }
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  
  // Настройка CORS
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'http://localhost:5173', // Vite порт
    'http://localhost:4173', // Vite preview порт
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

      // В production разрешаем все запросы
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
  Logger.log(`📁 Frontend path: ${frontendDistPath}`);
  Logger.log(`🔗 Access: http://localhost:${port}`);

  console.log('ПОРТ БАЗЫ ДАННЫХ ИЗ ОКРУЖЕНИЯ VERCEL:', process.env.DB_PORT);
  console.log('ХОСТ БАЗЫ ДАННЫХ ИЗ ОКРУЖЕНИЯ VERCEL:', process.env.DB_HOST);
}

bootstrap();