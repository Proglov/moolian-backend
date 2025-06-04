import { INestApplication } from "@nestjs/common";
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { JWT_Cookie_Name } from './common/constants';
import { corsOptions } from './configs/cors.config';
import { ConfigService } from "@nestjs/config";

export default function createApp(app: INestApplication) {
    const configService = app.get(ConfigService);
    const PORT = configService.get<number>('PORT');
    const ENV = configService.get<string>('NODE_ENV');
    const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS').split(',')

    //global validation pipe
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }))

    //cookie parser
    app.use(cookieParser());

    //cors
    app.enableCors(corsOptions(allowedOrigins))

    //swagger configuration
    if (ENV === 'development') {
        const config = new DocumentBuilder()
            .setTitle('Moolian')
            .setLicense('MIT', 'https://github.com/git/git-scm.com/blob/main/MIT-LICENCE.txt')
            .addServer('http://localhost:' + PORT)
            .addCookieAuth(JWT_Cookie_Name)
            .setVersion('1.0')
            .setExternalDoc('Postman Collection', '/api-json')
            .build();
        const document = SwaggerModule.createDocument(app, config)
        SwaggerModule.setup('api', app, document)
    }
};