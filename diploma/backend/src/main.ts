import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

async function bootstrap() {
  // Создаем базу данных если не существует
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS diploma_db`);
  await connection.end();

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 3000;

  await app.listen(port);
  Logger.log(`Application started on port ${port}`);
}
bootstrap();
