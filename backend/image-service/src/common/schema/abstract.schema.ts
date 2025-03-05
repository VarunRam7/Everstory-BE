import { Prop } from '@nestjs/mongoose';

export class AbstractSchema {
  _id: string;

  @Prop()
  readonly createdAt: Date;
  @Prop()
  readonly updatedAt: Date;
}
