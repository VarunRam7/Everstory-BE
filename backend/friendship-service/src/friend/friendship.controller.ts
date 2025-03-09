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
  UseGuards,
} from '@nestjs/common';
import { RouteConstants } from '../common/constant/route.constant';
import { FollowRequestDTO } from './dto/request/follow-request.dto';
import { FollowRequestService } from './follow-request.service';
import { ResponseEnum } from '../common/enum/follow-request-status.enum';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventConstants } from '../common/constant/event.constant';
import { RelationshipService } from './relationship.service';
import { MicroserviceJwtAuthGuard } from '../guard/base-auth-guard/microservice-jwt-auth-guard';
import { LoggedInUser } from '../common/decorator/logged-in-user.decorator';

@Controller(RouteConstants.FRIENDSHIP_CONTROLLER)
export class FriendshipController {
  constructor(
    private readonly followRequestService: FollowRequestService,
    private readonly relationshipService: RelationshipService,
  ) {}

  @UseGuards(MicroserviceJwtAuthGuard)
  @Post(RouteConstants.CREATE_FOLLOW_REQUEST)
  async createFollowRequest(
    @Body() followRequestDTO: FollowRequestDTO,
    @LoggedInUser() loggedInUser: any,
  ) {
    return this.followRequestService.createFollowRequest(
      followRequestDTO,
      loggedInUser._id,
    );
  }

  @UseGuards(MicroserviceJwtAuthGuard)
  @Delete(RouteConstants.UNFOLLOW_USER)
  async unfollowUser(
    @LoggedInUser() loggedInUser: any,
    @Query('requestTo') requestTo: string,
  ) {
    return this.relationshipService.unfollowUser(loggedInUser._id, requestTo);
  }

  @UseGuards(MicroserviceJwtAuthGuard)
  @Delete(RouteConstants.REVOKE_REQUEST)
  async revokeRequest(
    @LoggedInUser() loggedInUser: any,
    @Query('requestTo') requestTo: string,
  ) {
    return this.followRequestService.revokeRequest(loggedInUser._id, requestTo);
  }

  @UseGuards(MicroserviceJwtAuthGuard)
  @Get(RouteConstants.GET_FOLLOW_REQUESTS_FOR_USER)
  async getFollowRequestsForUser(@LoggedInUser() loggedInUser: any) {
    return this.followRequestService
      .getPendingFollowRequests(loggedInUser._id)
      .catch((error) => {
        throw error;
      });
  }

  @UseGuards(MicroserviceJwtAuthGuard)
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

  @MessagePattern(EventConstants.FOLLOWING_USERS)
  async getFollowingUsers(@Payload() data: { userId: string }) {
    const { userId } = data;
    return await this.relationshipService.getFollowingUsers(userId);
  }
}
