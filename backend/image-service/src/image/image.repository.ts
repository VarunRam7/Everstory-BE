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

  async findPostsByUser(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<{
    posts: ImageDocument[];
    totalCount: number;
    nextPage?: number;
  }> {
    const skip = (page - 1) * pageSize;

    const posts = await this.imageModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const totalPosts = await this.imageModel.countDocuments({
      userId: new Types.ObjectId(userId),
    });

    const nextPage = skip + pageSize < totalPosts ? page + 1 : undefined;

    return { posts, totalCount: totalPosts, nextPage };
  }

  async findPostsByUsers(
    userIds: string[],
    page: number,
    pageSize: number,
  ): Promise<{
    posts: ImageDocument[];
    totalCount: number;
    nextPage?: number;
  }> {
    const skip = (page - 1) * pageSize;

    const objectIdArray = userIds.map((id) => new Types.ObjectId(id));

    const posts = await this.imageModel
      .find({ userId: { $in: objectIdArray } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const totalPosts = await this.imageModel.countDocuments({
      userId: { $in: objectIdArray },
    });

    const nextPage = skip + pageSize < totalPosts ? page + 1 : undefined;

    return { posts, totalCount: totalPosts, nextPage };
  }

  async deletePostById(postId: string) {
    return await this.imageModel.deleteOne({ _id: new Types.ObjectId(postId) });
  }
}
