import { ClientsModule, Transport } from '@nestjs/microservices';

import { ConfigModule } from '@nestjs/config';
import { DbConstants } from '../common/constant/db.constant';
import { ImageController } from './image.controller';
import { ImageGateway } from './image.gateway';
import { ImageRepository } from './image.repository';
import { ImageSchema } from './schema/image.schema';
import { ImageService } from './image.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: DbConstants.post, schema: ImageSchema },
    ]),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3001 }, //TODO change to auth-service when migrating to docker compose from local server
      },
    ]),
    ClientsModule.register([
      {
        name: 'FRIENDSHIP_SERVICE',
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3003 }, //TODO change to friendship-service when migrating to docker compose from local server
      },
    ]),
  ],
  controllers: [ImageController],
  providers: [ImageService, ImageRepository, ImageGateway],
  exports: [ImageService, ImageGateway],
})
export class ImageModule {}
