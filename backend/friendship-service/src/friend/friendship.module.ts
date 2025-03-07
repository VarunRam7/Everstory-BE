import { ClientsModule, Transport } from '@nestjs/microservices';

import { ConfigModule } from '@nestjs/config';
import { DbConstants } from '../common/constant/db.constant';
import { FollowRequestRepository } from './follow-request.repository';
import { FollowRequestSchema } from './schema/follow-request.schema';
import { FollowRequestService } from './follow-request.service';
import { FriendshipController } from './friendship.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RelationshipRepository } from './relationship.repository';
import { RelationshipSchema } from './schema/relationship.schema';
import { RelationshipService } from './relationship.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: DbConstants.followRequest, schema: FollowRequestSchema },
      { name: DbConstants.relationship, schema: RelationshipSchema },
    ]),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3001 }, //TODO change to auth-service when migrating to docker compose from local server
      },
    ]),
  ],
  controllers: [FriendshipController],
  providers: [
    FollowRequestService,
    FollowRequestRepository,
    RelationshipRepository,
    RelationshipService,
  ],
  exports: [FollowRequestService, RelationshipService],
})
export class FriendshipModule {}
