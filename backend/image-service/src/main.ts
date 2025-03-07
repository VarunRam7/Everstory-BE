import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { ApiConstants } from './common/constant/api.constant';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.setGlobalPrefix(ApiConstants.GLOBAL_PREFIX);

  const microservice =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 3002,
      },
    });
  await microservice.listen();
  await app.listen(process.env.PORT ?? 5001);
}
bootstrap();
