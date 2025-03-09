import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        dbName: configService.get<string>('DB_NAME'),
      }),
    }),
    AuthModule,
    ClientsModule.register([
      {
        name: 'IMAGE_SERVICE',
        transport: Transport.TCP,
        options: { host: 'image-service', port: 3002 },
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
