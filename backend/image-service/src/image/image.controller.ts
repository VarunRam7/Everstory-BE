import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Logger,
  Body,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { RouteConstants } from '../common/constant/route.constant';

@Controller(RouteConstants.IMAGE_CONTROLLER)
export class ImageController {
  private readonly logger = new Logger(ImageController.name);
  constructor(private readonly imageService: ImageService) {}

  @Post(RouteConstants.UPLOAD_PROFILE_PHOTO)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('email') email: any,
  ) {
    const imageUrl = await this.imageService.uploadImage(file, email);
    return { url: imageUrl };
  }

  @Post(RouteConstants.UPLOAD_POST)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPost(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
    @Body('caption') caption: string,
  ) {
    const imageUrl = await this.imageService.uploadPost(file, userId, caption);
    return { url: imageUrl };
  }

  @Delete(RouteConstants.REMOVE_PROFILE_PHOTO)
  async removeProfilePhoto(
    @Body('profileImageUrl') profileImageUrl: string,
    @Body('email') email: string,
  ) {
    return await this.imageService.removeProfilePhoto(profileImageUrl, email);
  }
}
