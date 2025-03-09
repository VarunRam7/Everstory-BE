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
        options: { host: 'auth-service', port: 3001 },
      },
    ]),
    ClientsModule.register([
      {
        name: 'FRIENDSHIP_SERVICE',
        transport: Transport.TCP,
        options: { host: 'friendship-service', port: 3003 },
      },
    ]),
  ],
  controllers: [ImageController],
  providers: [ImageService, ImageRepository, ImageGateway],
  exports: [ImageService, ImageGateway],
})
export class ImageModule {}
