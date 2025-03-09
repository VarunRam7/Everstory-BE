import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Logger,
  Body,
  BadRequestException,
  Delete,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { RouteConstants } from '../common/constant/route.constant';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventConstants } from '../common/constant/event.constant';
import { MicroserviceJwtAuthGuard } from './guard/base-auth-guard/microservice-jwt-auth-guard';
import { LoggedInUser } from '../common/decorator/logged-in-user.decorator';

@Controller(RouteConstants.IMAGE_CONTROLLER)
export class ImageController {
  private readonly logger = new Logger(ImageController.name);
  constructor(private readonly imageService: ImageService) {}

  @UseGuards(MicroserviceJwtAuthGuard)
  @Post(RouteConstants.UPLOAD_PROFILE_PHOTO)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @LoggedInUser() loggedInUser: any,
  ) {
    const imageUrl = await this.imageService
      .uploadImage(file, loggedInUser.email)
      .catch((error) => {
        throw error;
      });
    return { url: imageUrl };
  }

  @UseGuards(MicroserviceJwtAuthGuard)
  @Post(RouteConstants.UPLOAD_POST)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPost(
    @UploadedFile() file: Express.Multer.File,
    @LoggedInUser() loggedInUser: any,
    @Body('caption') caption: string,
  ) {
    const imageUrl = await this.imageService
      .uploadPost(file, loggedInUser._id, caption)
      .catch((error) => {
        throw error;
      });
    return { url: imageUrl };
  }

  @UseGuards(MicroserviceJwtAuthGuard)
  @Delete(RouteConstants.REMOVE_PROFILE_PHOTO)
  async removeProfilePhoto(
    @Body('profileImageUrl') profileImageUrl: string,
    @LoggedInUser() loggedInUser: any,
  ) {
    return await this.imageService
      .removeProfilePhoto(profileImageUrl, loggedInUser.email)
      .catch((error) => {
        throw error;
      });
  }

  @UseGuards(MicroserviceJwtAuthGuard)
  @Get(RouteConstants.GET_MY_POSTS)
  async getMyPosts(
    @LoggedInUser() loggedInUser: any,
    @Query('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    if (!loggedInUser._id) {
      throw new BadRequestException('User ID is required');
    }

    return await this.imageService
      .getMyPosts(userId ? userId : loggedInUser._id, page, pageSize)
      .catch((error) => {
        throw error;
      });
  }

  @UseGuards(MicroserviceJwtAuthGuard)
  @Get(RouteConstants.GET_HOME_FEED)
  async getHomeFeed(
    @LoggedInUser() loggedInUser: any,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    if (!loggedInUser._id) {
      throw new BadRequestException('User ID is required');
    }
    return await this.imageService
      .getHomeFeed(loggedInUser._id, page, pageSize)
      .catch((error) => {
        throw error;
      });
  }

  @UseGuards(MicroserviceJwtAuthGuard)
  @Delete(RouteConstants.DELETE_POST)
  async deletePost(
    @Param('postId') postId: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    return await this.imageService
      .deletePost(postId, imageUrl)
      .catch((error) => {
        throw error;
      });
  }

  @MessagePattern(EventConstants.GET_USER_POSTS)
  async handleUpdateProfilePhoto(
    @Payload()
    data: {
      userId: string;
      page: 1;
      pageSize: 10;
    },
  ) {
    const { userId, page, pageSize } = data;

    return await this.imageService
      .getMyPosts(userId, page, pageSize)
      .catch((error) => {
        throw error;
      });
  }
}
