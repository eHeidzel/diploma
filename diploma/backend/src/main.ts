import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './modules/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Настройка статических файлов для загрузок
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Раздаем фронтенд (для продакшена)
  const frontendDistPath = join(__dirname, '..', '..', 'frontend', 'dist');
  if (fs.existsSync(frontendDistPath)) {
    app.useStaticAssets(frontendDistPath);
    Logger.log(`✅ Frontend build found at: ${frontendDistPath}`);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Настройка CORS для Railway
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:4173',
    'https://diploma-production-f729.up.railway.app',
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.VERCEL_BRANCH_URL
      ? `https://${process.env.VERCEL_BRANCH_URL}`
      : null,
    /\.railway\.app$/,
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

  const port = process.env.PORT || 8080;
  await app.listen(port);

  Logger.log(`🚀 Application is running on port ${port}`);
  Logger.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  Logger.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || `http://localhost:${port}`}`);
  Logger.log(`🔗 API URL: ${process.env.API_URL || `http://localhost:${port}`}`);
}

bootstrap();