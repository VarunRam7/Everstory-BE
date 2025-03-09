import { ClientsModule, Transport } from '@nestjs/microservices';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { DbConstants } from '../common/constant/db.constant';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './guard/strategy/jwt.strategy';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UserRepository } from './user.repository';
import { UserSchema } from './schema/user.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: DbConstants.user, schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret',
      signOptions: { expiresIn: '24h' },
    }),
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
  controllers: [AuthController],
  providers: [AuthService, UserRepository, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
