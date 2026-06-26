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
  app.enableCors({
    origin: true,
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
  
  // ВАЖНО: Для продакшена настраиваем SPA роутинг
  if (process.env.NODE_ENV === 'production') {
    // Для всех запросов, кроме API и статики, отдаем index.html
    app.use((req, res, next) => {
      // Пропускаем API запросы и запросы к статике
      if (req.path.startsWith('/api') || 
          req.path.startsWith('/uploads') || 
          req.path.startsWith('/auth') ||
          req.path.startsWith('/profile') ||
          req.path.startsWith('/activities') ||
          req.path.startsWith('/schedule') ||
          req.path.startsWith('/admin') ||
          req.path.startsWith('/teachers') ||
          req.path.startsWith('/reviews') ||
          req.path.startsWith('/notifications') ||
          req.path.startsWith('/settings') ||
          req.path.startsWith('/balance') ||
          req.path.startsWith('/materials') ||
          req.path.startsWith('/projects') ||
          req.path.startsWith('/statistics') ||
          req.path.startsWith('/teacher-requests') ||
          req.path.startsWith('/teacher') ||
          req.path.startsWith('/questions')) {  // <-- ДОБАВЛЕНО /questions
        return next();
      }
      
      // Для всех остальных запросов отдаем index.html
      const indexPath = join(__dirname, '..', '..', 'frontend', 'dist', 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        next();
      }
    });
  }

  await app.listen(port);

  Logger.log(`🚀 Application is running on port ${port}`);
  Logger.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();