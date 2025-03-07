import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { AbstractSchema } from '../../common/schema/abstract.schema';
import { DbConstants } from '../../common/constant/db.constant';

export type RelationshipDocument = HydratedDocument<Relationship>;

@Schema({ timestamps: true, collection: DbConstants.relationship })
export class Relationship extends AbstractSchema {
  @Prop({ type: Types.ObjectId, ref: DbConstants.user, required: true })
  followedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: DbConstants.user, required: true })
  followed: Types.ObjectId;
}

export const RelationshipSchema = SchemaFactory.createForClass(Relationship);
