import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { JwtAuthGuard } from './auth/guard';
import { TransformInterceptor } from './core/transform.interceptor';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe()); // add middleware

  // global guard
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // global interceptor => customize message
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  // config CORS
  app.enableCors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
  });

  const logger = new Logger('bootstrap');
  await app.listen(configService.get<number>('PORT'), () => {
    logger.log(`http://localhost:${configService.get<number>('PORT')}`)
  });
}
bootstrap();
