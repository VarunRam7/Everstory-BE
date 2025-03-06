import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { EventConstants } from '../common/constant/event.constant';
import { lastValueFrom } from 'rxjs';
import { nanoid } from 'nanoid';
import { ImageRepository } from './image.repository';

@Injectable()
export class ImageService {
  constructor(
    private configService: ConfigService,
    @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy,
    private readonly imageRepository: ImageRepository,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }
  private readonly logger = new Logger(ImageService.name);

  async uploadImage(file: Express.Multer.File, email: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file) {
        this.logger.warn('No file received');
        return { message: 'No file uploaded' };
      }

      if (!email) {
        throw new BadRequestException(
          `Email is required for uploading profile picture`,
        );
      }

      this.logger.log(
        `Attempting to upload profile picture for email :: ${email}`,
      );
      const publicId = `${email.replace(/[@.]/g, '_')}`;

      cloudinary.uploader
        .upload_stream(
          {
            folder: 'profile_pictures',
            public_id: publicId,
            overwrite: true,
            invalidate: true,
          },
          async (error, result: UploadApiResponse) => {
            if (error) {
              this.logger.error(`Cloudinary upload failed :: ${error.message}`);
              reject(error);
            } else {
              this.logger.log(
                `Profile picture uploaded successfully in cloudinary for email :: ${email}`,
              );
              try {
                await lastValueFrom(
                  this.authServiceClient.send(
                    EventConstants.UPDATE_PROFILE_PHOTO,
                    {
                      email,
                      profilePhotoUrl: result.secure_url,
                    },
                  ),
                );
                this.logger.log(
                  `Profile picture updated successfully in user collection`,
                );
                resolve(result.secure_url);
              } catch (eventError) {
                this.logger.error(
                  'Error sending update event to auth-service:',
                  eventError,
                );
                reject(eventError);
              }
            }
          },
        )
        .end(file.buffer);
    });
  }

  async uploadPost(
    file: Express.Multer.File,
    userId: string,
    caption: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file) {
        this.logger.warn('No file received');
        throw new BadRequestException('No file uploaded');
      }

      if (!userId) {
        throw new BadRequestException(
          'User Id is required for uploading a post',
        );
      }

      this.logger.log(`Attempting to upload post for id :: ${userId}`);

      const publicId = `${userId}_${nanoid()}`;

      cloudinary.uploader
        .upload_stream(
          {
            folder: 'posts',
            public_id: publicId,
            overwrite: false,
            invalidate: true,
          },
          async (error: UploadApiErrorResponse, result: UploadApiResponse) => {
            if (error) {
              this.logger.error(`Cloudinary upload failed :: ${error.message}`);
              reject(error);
            } else {
              this.logger.log(
                `Post uploaded successfully in Cloudinary for id :: ${userId}`,
              );

              try {
                await this.imageRepository.createPost(
                  userId,
                  result.secure_url,
                  caption,
                );
                this.logger.log(`Post saved successfully in MongoDB`);
                resolve(result.secure_url);
              } catch (dbError) {
                this.logger.error(
                  'Error saving post to MongoDB:',
                  dbError.message,
                );
                reject(dbError);
              }
            }
          },
        )
        .end(file.buffer);
    });
  }

  async removeProfilePhoto(imageUrl: string, email: string): Promise<string> {
    if (!imageUrl) {
      throw new BadRequestException('Image URL is required');
    }

    this.logger.log(
      `Attempting to delete profile picture for email :: ${email}`,
    );
    try {
      const publicId = imageUrl
        .split('/')
        .slice(-2)
        .join('/')
        .replace(/\.[^.]+$/, '');

      await cloudinary.uploader.destroy(publicId);

      this.logger.log(`Deleted ${publicId} successfully from Cloudinary`);

      const response = await lastValueFrom(
        this.authServiceClient.send(EventConstants.REMOVE_PROFILE_PHOTO, {
          email,
        }),
      );

      this.logger.log(
        `Removed profile picture from user collection successfully`,
      );

      return response;
    } catch (error) {
      this.logger.error('Error deleting Cloudinary image:', error);
      throw new BadRequestException('Failed to delete image from Cloudinary');
    }
  }

  async getMyPosts(userId: string, page: number, pageSize: number) {
    this.logger.log(`Attempting to find posts for user :: ${userId}`);

    const { posts, totalCount, nextPage } =
      await this.imageRepository.findPostsByUser(userId, page, pageSize);

    if (!posts || posts.length === 0) {
      this.logger.warn(`No posts found for user :: ${userId}`);
      return { posts: [], nextPage: null };
    }
    this.logger.log(`Posts successfully found for user :: ${userId}`);
    return { posts, totalCount, nextPage };
  }

  async deletePost(postId: string, imageUrl: string) {
    this.logger.log(`Attempting to delete post :: ${postId}`);

    try {
      if (!postId)
        throw new BadRequestException(`Post id is required to delete the post`);

      await this.imageRepository.deletePostById(postId);
      this.logger.log(`Deleted post :: ${postId} successfully`);

      const publicId = imageUrl
        .split('/')
        .slice(-2)
        .join('/')
        .replace(/\.[^.]+$/, '');

      this.logger.log(
        `Attempting to delete post :: ${publicId} from Cloudinary`,
      );
      await cloudinary.uploader.destroy(publicId);

      this.logger.log(`Deleted ${publicId} successfully from Cloudinary`);

      return { message: 'Post deleted successfully' };
    } catch (error) {
      this.logger.error(
        `Error while attempting to delete post :: ${postId} | Error :: ${error}`,
      );
      throw new Error(`Failed to delete post`);
    }
  }
}
