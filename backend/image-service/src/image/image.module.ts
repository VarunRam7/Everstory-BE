import { ClientsModule, Transport } from '@nestjs/microservices';

import { ConfigModule } from '@nestjs/config';
import { DbConstants } from '../common/constant/db.constant';
import { ImageController } from './image.controller';
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
  ],
  controllers: [ImageController],
  providers: [ImageService, ImageRepository],
  exports: [ImageService],
})
export class ImageModule {}
