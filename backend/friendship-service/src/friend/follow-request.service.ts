import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  CreateFollowRequestDTO,
  UserInfoDTO,
} from './dto/request/create-follow-request.dto';
import { FollowRequest } from './schema/follow-request.schema';
import { FollowRequestDTO } from './dto/request/follow-request.dto';
import { FollowRequestRepository } from './follow-request.repository';
import {
  FollowRequestStatus,
  ResponseEnum,
} from '../common/enum/follow-request-status.enum';
import { generateRandomAlphanumericString } from '../common/util/token-generator.util';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { EventConstants } from '../common/constant/event.constant';
import { RelationshipService } from './relationship.service';
import { FollowRequestGateway } from './follow-request.gateway';

@Injectable()
export class FollowRequestService {
  constructor(
    private readonly followRequestRepository: FollowRequestRepository,
    @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy,
    private readonly relationshipService: RelationshipService,
    @Inject(forwardRef(() => FollowRequestGateway))
    private readonly followRequestGateway: FollowRequestGateway,
  ) {}
  private readonly logger = new Logger(FollowRequestService.name);

  async createFollowRequest(
    followRequestDTO: FollowRequestDTO,
  ): Promise<FollowRequest> {
    if (followRequestDTO.requestBy === followRequestDTO.requestTo) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const existingRequest =
      await this.followRequestRepository.findActiveFollowRequest(
        followRequestDTO.requestBy,
        followRequestDTO.requestTo,
      );

    if (existingRequest) {
      throw new BadRequestException(`You’ve already sent a follow request!`);
    }

    let requestByUser, requestToUser;

    try {
      this.logger.log(
        `Attempting to fetch user details of both - follower :: ${followRequestDTO.requestBy} and to be followed :: ${followRequestDTO.requestTo}`,
      );
      const response = await lastValueFrom(
        this.authServiceClient.send(EventConstants.GET_FOLLOW_REQUEST_DETAILS, {
          requestBy: followRequestDTO.requestBy,
          requestTo: followRequestDTO.requestTo,
        }),
      );

      [requestByUser, requestToUser] = response;

      this.logger.log(
        `Fetched user details of both - follower :: ${followRequestDTO.requestBy} and to be followed :: ${followRequestDTO.requestTo}`,
      );
    } catch (eventError) {
      this.logger.error(`Error sending get event to auth-service:`, eventError);
    }

    const createFollowRequestDTO = new CreateFollowRequestDTO(
      new UserInfoDTO(
        requestByUser.id,
        requestByUser.firstName,
        requestByUser.lastName,
        requestByUser.profilePhoto,
        requestByUser.isPrivate,
      ),
      new UserInfoDTO(
        requestToUser.id,
        requestToUser.firstName,
        requestToUser.lastName,
        requestToUser.profilePhoto,
        requestToUser.isPrivate,
      ),
      generateRandomAlphanumericString(10),
      FollowRequestStatus.PENDING,
      false,
    );

    const followRequest =
      await this.followRequestRepository.createFollowRequest(
        createFollowRequestDTO,
      );
    await this.followRequestGateway.notifyNewFollowRequest(
      createFollowRequestDTO.getRequestTo().id.toString(),
    );

    this.logger.log(
      `Successfully created a follow request from ${followRequest.requestBy} to ${followRequest.requestTo}`,
    );
    return followRequest;
  }

  async revokeRequest(requestBy: string, requestTo: string) {
    try {
      const result = await this.followRequestRepository.revokeRequest(
        requestBy,
        requestTo,
      );
      if (!result) {
        this.logger.warn(
          `No existing request found between ${requestBy} and ${requestTo}`,
        );
        return null;
      }
      await this.followRequestGateway.notifyNewFollowRequest(requestTo);

      this.logger.log(
        `user :: ${requestBy} revoked the follow request sent to user :: ${requestTo}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error while attempting to revoke request between ${requestBy} and ${requestTo} | Error : ${error}`,
      );
      throw error;
    }
  }

  async getPendingFollowRequests(userId: string): Promise<FollowRequest[]> {
    return new Promise((resolve, reject) => {
      this.followRequestRepository
        .findPendingFollowRequests(userId)
        .then((followRequests) => {
          this.logger.log(
            `Fetched all follow requests for user :: ${userId}. Number of pending follow requests - ${followRequests.length}`,
          );
          resolve(followRequests);
        })
        .catch((error) => {
          this.logger.error(
            `Error while attempting to fetch follow requests for user :: ${userId}`,
          );
          reject(error);
        });
    });
  }

  async respondToRequest(inviteToken: string, status: ResponseEnum) {
    if (!inviteToken || !status) {
      throw new BadRequestException('Invite token and status are required');
    }

    const followRequestDetails =
      await this.followRequestRepository.findOneByToken(inviteToken);

    if (!followRequestDetails) {
      throw new BadRequestException('Follow request details not found');
    }

    const updatedFollowRequest =
      await this.followRequestRepository.updateFollowRequestStatus(
        inviteToken,
        status,
      );

    if (!updatedFollowRequest) {
      throw new BadRequestException('Invalid or expired invite token');
    }

    if (status === ResponseEnum.ACCEPTED) {
      await this.relationshipService
        .createRelationship(
          followRequestDetails.requestBy.id.toString(),
          followRequestDetails.requestTo.id.toString(),
        )
        .catch((error) => {
          throw error;
        });
    }

    return updatedFollowRequest;
  }

  async getPendingFollowRequestBetweenTwo(
    followedBy: string,
    followed: string,
  ): Promise<FollowRequest | null> {
    return new Promise((resolve, reject) => {
      this.followRequestRepository
        .findPendingFollowRequestBetweenTwo(followedBy, followed)
        .then((followRequest) => {
          if (followRequest) {
            this.logger.log(
              `Found a pending request for user :: ${followed} from user :: ${followedBy}`,
            );
            resolve(followRequest);
          } else {
            this.logger.log(
              `No pending request found for user :: ${followed} from user :: ${followedBy}`,
            );
            resolve(null);
          }
        })
        .catch((error) => {
          this.logger.error(
            `Error while attempting to check whether a follow request for user :: ${followed} from user :: ${followedBy} exists or not`,
          );
          reject(error);
        });
    });
  }
}
