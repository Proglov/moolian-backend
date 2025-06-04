import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as colors from 'colors';
import { ConfigService } from '@nestjs/config';
import createApp from './app.create';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT');
  const ENV = configService.get<string>('NODE_ENV');

  createApp(app)
  //app listen
  if (ENV === 'development') {
    await app.listen(PORT);
  } else {
    await app.listen(PORT, '0.0.0.0');
  }


  const messages = [
    colors.black.bgWhite.bold('App Running in '.toUpperCase()),
    colors.green.bgWhite.bold(ENV.toUpperCase()),
    colors.black.bgWhite.bold(' environment on port '.toUpperCase()),
    colors.green.bgWhite.bold(PORT.toString().toUpperCase()),
    ''
  ]

  console.log(...messages);
  ENV === 'development' && console.log(colors.magenta.bold('http://localhost:' + PORT + '/api/'));
}

bootstrap();