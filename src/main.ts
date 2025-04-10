import * as http from 'http';
import * as express from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';


async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.useGlobalFilters(new HttpExceptionFilter());
  const configService = app.get(ConfigService);
  app.setGlobalPrefix("api")

  const config = new DocumentBuilder()
    .setTitle('Project')
    .setDescription('Api description')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'https://fe-journey.onrender.com', 'http://3.0.139.123'], // Allow frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use(cookieParser());
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api", app, document)

  await app.init();
  http.createServer(server).listen(configService.get('PORT'), '0.0.0.0');
  console.log("Server is runing on port : " + configService.get('PORT'))

}
bootstrap();
