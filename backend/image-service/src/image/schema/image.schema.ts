import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { AbstractSchema } from '../../common/schema/abstract.schema';
import { DbConstants } from '../../common/constant/db.constant';

export type ImageDocument = HydratedDocument<Image>;

@Schema({ timestamps: true, collection: DbConstants.post })
export class Image extends AbstractSchema {
  @Prop({ type: Types.ObjectId, ref: DbConstants.user, required: true })
  userId: Types.ObjectId;

  @Prop({ required: false })
  caption?: string;

  @Prop({ default: null, type: String })
  imageUrl: string | null;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
