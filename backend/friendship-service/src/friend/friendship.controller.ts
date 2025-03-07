import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  BadRequestException,
  Delete,
  Query,
} from '@nestjs/common';
import { RouteConstants } from '../common/constant/route.constant';
import { FollowRequestDTO } from './dto/request/follow-request.dto';
import { FollowRequestService } from './follow-request.service';
import { ResponseEnum } from '../common/enum/follow-request-status.enum';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventConstants } from '../common/constant/event.constant';
import { RelationshipService } from './relationship.service';

@Controller(RouteConstants.FRIENDSHIP_CONTROLLER)
export class FriendshipController {
  constructor(
    private readonly followRequestService: FollowRequestService,
    private readonly relationshipService: RelationshipService,
  ) {}

  @Post(RouteConstants.CREATE_FOLLOW_REQUEST)
  async createFollowRequest(@Body() followRequestDTO: FollowRequestDTO) {
    return this.followRequestService.createFollowRequest(followRequestDTO);
  }

  @Delete(RouteConstants.UNFOLLOW_USER)
  async unfollowUser(
    @Query('requestBy') requestBy: string,
    @Query('requestTo') requestTo: string,
  ) {
    return this.relationshipService.unfollowUser(requestBy, requestTo);
  }

  @Delete(RouteConstants.REVOKE_REQUEST)
  async revokeRequest(
    @Query('requestBy') requestBy: string,
    @Query('requestTo') requestTo: string,
  ) {
    return this.followRequestService.revokeRequest(requestBy, requestTo);
  }

  @Get(RouteConstants.GET_FOLLOW_REQUESTS_FOR_USER)
  async getFollowRequestsForUser(@Param('userId') userId: string) {
    return this.followRequestService
      .getPendingFollowRequests(userId)
      .catch((error) => {
        throw error;
      });
  }

  @Patch(RouteConstants.RESPOND_FOLLOW_REQUEST)
  async respondToRequest(
    @Body('requestToken') requestToken: string,
    @Body('status') status: ResponseEnum,
  ) {
    return this.followRequestService.respondToRequest(requestToken, status);
  }

  @MessagePattern(EventConstants.IS_FOLLOWING)
  async isFollowing(@Payload() data: { followedBy: string; followed: string }) {
    const { followedBy, followed } = data;
    return await this.relationshipService.isFollowing(followedBy, followed);
  }

  @MessagePattern(EventConstants.IS_REQUESTED)
  async getPendingFollowRequestBetweenTwo(
    @Payload() data: { followedBy: string; followed: string },
  ) {
    const { followedBy, followed } = data;
    return await this.followRequestService.getPendingFollowRequestBetweenTwo(
      followedBy,
      followed,
    );
  }

  @MessagePattern(EventConstants.FOLLOW_COUNT)
  async getUserFollowerFollowingCount(@Payload() data: { userId: string }) {
    const { userId } = data;
    return await this.relationshipService.getUserFollowerFollowingCount(userId);
  }
}
