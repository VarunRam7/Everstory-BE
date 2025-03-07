import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DbConstants } from '../common/constant/db.constant';
import {
  FollowRequest,
  FollowRequestDocument,
} from './schema/follow-request.schema';
import { CreateFollowRequestDTO } from './dto/request/create-follow-request.dto';
import {
  FollowRequestStatus,
  ResponseEnum,
} from '../common/enum/follow-request-status.enum';

@Injectable()
export class FollowRequestRepository {
  constructor(
    @InjectModel(DbConstants.followRequest)
    private followRequestModel: Model<FollowRequestDocument>,
  ) {}
  private readonly logger = new Logger(FollowRequestRepository.name);

  async createFollowRequest(
    createFollowRequestDTO: CreateFollowRequestDTO,
  ): Promise<FollowRequestDocument> {
    this.logger.log(
      `Attempting to create a follow request from ${createFollowRequestDTO.getRequestBy().id} to ${createFollowRequestDTO.getRequestTo().id}`,
    );

    return this.followRequestModel.create({
      ...createFollowRequestDTO,
      requestBy: {
        ...createFollowRequestDTO.getRequestBy(),
        id: new Types.ObjectId(createFollowRequestDTO.getRequestBy().id),
      },
      requestTo: {
        ...createFollowRequestDTO.getRequestTo(),
        id: new Types.ObjectId(createFollowRequestDTO.getRequestTo().id),
      },
    });
  }

  async findActiveFollowRequest(requestBy: string, requestTo: string) {
    this.logger.log(
      `Attempting to find whether an active follow request exists for user :: ${requestTo} from ${requestBy} `,
    );
    return this.followRequestModel.findOne({
      requestBy: new Types.ObjectId(requestBy),
      requestTo: new Types.ObjectId(requestTo),
      isExpired: false,
      status: FollowRequestStatus.PENDING,
    });
  }

  async findPendingFollowRequests(userId: string): Promise<FollowRequest[]> {
    this.logger.log(`Attempting to fetch all follow requests for ${userId}`);
    return this.followRequestModel
      .find({
        'requestTo.id': new Types.ObjectId(userId),
        isExpired: false,
        status: FollowRequestStatus.PENDING,
      })
      .exec();
  }

  async findPendingFollowRequestBetweenTwo(
    followedBy: string,
    followed: string,
  ): Promise<FollowRequest | null> {
    this.logger.log(
      `Attempting to check whether a follow request for user :: ${followed} from user :: ${followedBy} exists or not`,
    );
    return this.followRequestModel
      .findOne({
        'requestTo.id': new Types.ObjectId(followed),
        'requestBy.id': new Types.ObjectId(followedBy),
        isExpired: false,
        status: FollowRequestStatus.PENDING,
      })
      .lean()
      .exec();
  }

  async updateFollowRequestStatus(inviteToken: string, status: ResponseEnum) {
    this.logger.log(
      `Attempting to respond - ${status} to invite :: ${inviteToken}`,
    );
    return this.followRequestModel.findOneAndUpdate(
      { requestToken: inviteToken, isExpired: false },
      {
        $set: {
          status: status,
          isExpired: true,
        },
      },
      { new: true },
    );
  }

  async findOneByToken(inviteToken: string) {
    return this.followRequestModel
      .findOne({ requestToken: inviteToken })
      .lean();
  }

  async revokeRequest(requestBy: string, requestTo: string) {
    this.logger.log(
      `User :: ${requestBy} is attempting to revoke request sent to user :: ${requestTo}`,
    );
    return this.followRequestModel.findOneAndUpdate(
      {
        'requestBy.id': new Types.ObjectId(requestBy),
        'requestTo.id': new Types.ObjectId(requestTo),
        isExpired: false,
      },
      {
        $set: {
          isExpired: true,
        },
      },
    );
  }
}
