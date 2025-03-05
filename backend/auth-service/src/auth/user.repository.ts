import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import { SignupDTO } from './dto/request/signup.dto';
import { DbConstants } from '../common/constant/db.constant';
import { CreateUserDTO } from './dto/request/create-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(DbConstants.user)
    private readonly userModel: Model<UserDocument>,
  ) {}
  private readonly logger = new Logger(UserRepository.name);

  async findByEmail(email: string): Promise<UserDocument | null> {
    this.logger.log(`Attempting to find user by email :: ${email}`);
    return this.userModel.findOne({ email });
  }

  async createUser(createUserDTO: CreateUserDTO): Promise<UserDocument> {
    this.logger.log(
      `Attempting to create a new user with email :: ${createUserDTO.getEmail()}`,
    );
    return this.userModel.create({
      ...createUserDTO,
      email: createUserDTO.getEmail().toLowerCase(),
    });
  }

  async updateUserByEmail(email: string, updateData: Partial<User>) {
    this.logger.log(`Attempting to update user with email :: ${email}`);
    return this.userModel.updateOne({ email }, { $set: updateData }).exec();
  }
}
