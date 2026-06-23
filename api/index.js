// api/index.js
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../diploma/backend/dist/modules/app.module');
const { ValidationPipe } = require('@nestjs/common');
const { join } = require('path');

let app;

module.exports = async (req, res) => {
  if (!app) {
    app = await NestFactory.create(AppModule);
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      })
    );

    app.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    });
    
    await app.init();
  }
  
  // Перенаправляем запрос в NestJS
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp(req, res);
};