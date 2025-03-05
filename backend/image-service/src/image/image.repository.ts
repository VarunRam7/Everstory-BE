import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { DbConstants } from '../common/constant/db.constant';
import { ImageDocument } from './schema/image.schema';

@Injectable()
export class ImageRepository {
  constructor(
    @InjectModel(DbConstants.post)
    private readonly imageModel: Model<ImageDocument>,
  ) {}
  private readonly logger = new Logger(ImageRepository.name);

  async createPost(
    userId: string,
    imageUrl: string,
    caption: string,
  ): Promise<ImageDocument> {
    this.logger.log(`Attempting to create a new post for user :: ${userId}`);
    return this.imageModel.create({
      userId: new Types.ObjectId(userId.toString()),
      imageUrl,
      caption: caption || '',
    });
  }
}
