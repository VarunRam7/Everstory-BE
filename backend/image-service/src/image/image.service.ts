import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class ImageService {
  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'profile-images' }, // Cloudinary Folder
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined,
          ) => {
            if (error) return reject(error);
            resolve(result?.secure_url ?? '');
          },
        )
        .end(file.buffer);
    });
  }
}
