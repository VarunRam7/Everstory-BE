import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { AbstractSchema } from '../../common/schema/abstract.schema';
import { DbConstants } from '../../common/constant/db.constant';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: DbConstants.user })
export class User extends AbstractSchema {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ default: true })
  private: boolean;

  @Prop({ default: null, type: String })
  profilePhoto: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
