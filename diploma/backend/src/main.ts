import { AppModule } from '@modules/app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); // Опционально: добавляет /api ко всем роутам
  app.enableCors(); // Включает CORS, чтобы фронтенд мог делать запросы
  await app.listen(process.env.PORT ?? 3000);
}

// Это стандартный запуск для локальной разработки
if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}

// Экспортируем функцию инициализации для Vercel
export const getApp = async () => {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.init();
  return app.getHttpAdapter().getInstance();
};
