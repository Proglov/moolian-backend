import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as colors from 'colors';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))

  //swagger configuration
  const config = new DocumentBuilder().setVersion('1.0').build();
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  const PORT = process.env.PORT ?? 4500
  const ENV = process.env.NODE_ENV || 'unset'
  await app.listen(PORT);

  const messages = [
    colors.black.bgWhite.bold('App Running in '.toUpperCase()),
    colors.green.bgWhite.bold(ENV.toUpperCase()),
    colors.black.bgWhite.bold(' environment on port '.toUpperCase()),
    colors.green.bgWhite.bold(PORT.toString().toUpperCase()),
  ]

  console.log(...messages);
}

bootstrap();