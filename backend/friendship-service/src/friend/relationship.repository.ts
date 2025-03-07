import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DbConstants } from '../common/constant/db.constant';
import { RelationshipDocument } from './schema/relationship.schema';

@Injectable()
export class RelationshipRepository {
  constructor(
    @InjectModel(DbConstants.relationship)
    private readonly relationshipModel: Model<RelationshipDocument>,
  ) {}
  private readonly logger = new Logger(RelationshipRepository.name);

  async createRelationship(
    followedBy: string,
    followed: string,
  ): Promise<RelationshipDocument> {
    this.logger.log(
      `Attempting to create relationship between user ${followedBy} and user ${followed}`,
    );
    return this.relationshipModel.create({
      followedBy: new Types.ObjectId(followedBy),
      followed: new Types.ObjectId(followed),
    });
  }

  async findRelationship(
    followedBy: string,
    followed: string,
  ): Promise<RelationshipDocument | null> {
    this.logger.log(
      `Attempting to check if user :: ${followedBy} is following user :: ${followed}`,
    );
    return this.relationshipModel
      .findOne({
        followedBy: new Types.ObjectId(followedBy),
        followed: new Types.ObjectId(followed),
      })
      .exec();
  }

  async getFollowersAndFollowingCount(
    userId: string,
  ): Promise<{ followers: number; following: number }> {
    this.logger.log(
      `Attempting to fetch followers and following count for user :: ${userId}`,
    );
    const followersCount = await this.relationshipModel.countDocuments({
      followed: new Types.ObjectId(userId),
    });
    const followingCount = await this.relationshipModel.countDocuments({
      followedBy: new Types.ObjectId(userId),
    });

    return { followers: followersCount, following: followingCount };
  }

  async removeRelationship(followedBy: string, followed: string) {
    this.logger.log(
      `User :: ${followedBy} is attempting to unfollow user :: ${followed}`,
    );
    return this.relationshipModel
      .findOneAndDelete({
        followedBy: new Types.ObjectId(followedBy),
        followed: new Types.ObjectId(followed),
      })
      .exec();
  }
}
