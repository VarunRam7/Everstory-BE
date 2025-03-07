import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { AbstractSchema } from '../../common/schema/abstract.schema';
import { DbConstants } from '../../common/constant/db.constant';
import { FollowRequestStatus } from '../../common/enum/follow-request-status.enum';

export type FollowRequestDocument = HydratedDocument<FollowRequest>;

class UserInfo {
  @Prop({ type: Types.ObjectId, ref: DbConstants.user, required: true })
  id: Types.ObjectId;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  profilePhoto: string;

  @Prop({ required: true })
  isPrivate: boolean;
}

@Schema({ timestamps: true, collection: DbConstants.followRequest })
export class FollowRequest extends AbstractSchema {
  @Prop({ type: UserInfo, required: true })
  requestBy: UserInfo;

  @Prop({ type: UserInfo, required: true })
  requestTo: UserInfo;

  @Prop({
    required: true,
    unique: true,
  })
  requestToken: string;

  @Prop({ default: FollowRequestStatus.PENDING })
  status: string;

  @Prop({ default: false })
  isExpired: boolean;
}

export const FollowRequestSchema = SchemaFactory.createForClass(FollowRequest);
