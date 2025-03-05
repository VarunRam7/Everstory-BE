import { ApiConstants } from './common/constant/api.constant';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.setGlobalPrefix(ApiConstants.GLOBAL_PREFIX);

  await app.listen(process.env.PORT ?? 5001);
}
bootstrap();
