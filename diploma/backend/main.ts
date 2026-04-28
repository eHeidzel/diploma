import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/modules/app.module';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

async function bootstrap() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS diploma_db`);
  await connection.end();
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3000;

  await app.listen(port);

  Logger.log(`Application started on port ${port}`);
}
bootstrap();
