import { ClientsModule, Transport } from '@nestjs/microservices';

import { ConfigModule } from '@nestjs/config';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3001 }, //TODO change to auth-service when migrating to docker compose from local server
      },
    ]),
  ],
  controllers: [ImageController],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
