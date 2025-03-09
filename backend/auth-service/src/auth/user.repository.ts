import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import { DbConstants } from '../common/constant/db.constant';
import { CreateUserDTO } from './dto/request/create-user.dto';
import { createSearchPattern } from '../common/util/search.util';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(DbConstants.user)
    private readonly userModel: Model<UserDocument>,
  ) {}
  private readonly logger = new Logger(UserRepository.name);

  async findByEmail(
    email: string,
    hidePassword = false,
  ): Promise<UserDocument | null> {
    this.logger.log(`Attempting to find user by email :: ${email}`);

    if (hidePassword)
      return this.userModel.findOne({ email }).select('-passsword');
    else return this.userModel.findOne({ email });
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

  async fetchUsers(searchString?: string): Promise<UserDocument[]> {
    this.logger.log(
      `Attempting to fetch ${searchString ? `users with search string :: ${searchString}` : 'all users'}`,
    );

    if (!searchString) {
      return this.userModel.find().exec();
    }

    const searchPattern = createSearchPattern(searchString);

    return this.userModel
      .aggregate([
        {
          $addFields: {
            fullName: { $concat: ['$firstName', ' ', '$lastName'] },
          },
        },
        {
          $match: {
            $or: [
              { firstName: searchPattern },
              { lastName: searchPattern },
              { fullName: searchPattern },
            ],
          },
        },
      ])
      .exec();
  }

  async findUserById(userId: string): Promise<User | null> {
    this.logger.log(`Attempting to find user by id :: ${userId}`);
    return this.userModel
      .findById(new Types.ObjectId(userId))
      .select('-password')
      .lean()
      .exec();
  }

  async findAllPublicAccountUsers() {
    this.logger.log(`Attempting to fetch all public accounts`);
    return this.userModel.find({ isPrivate: false });
  }

  async findUserMinimalDetailsForIds(
    userIds: string[],
  ): Promise<UserDocument[] | null> {
    this.logger.log(
      `Attempting to find user details for ${userIds.length} users`,
    );
    const objectIdArray = userIds.map((id) => new Types.ObjectId(id));

    return this.userModel.find({ _id: { $in: objectIdArray } });
  }

  async updatePrivacySettingsForUser(isPrivate: boolean, userId: string) {
    this.logger.log(
      `Attempting to update privacy settings, isPrivate-${isPrivate} for user :: ${userId}`,
    );
    return this.userModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(userId) },
        {
          $set: {
            isPrivate,
          },
        },

        { new: true },
      )
      .select('-password');
  }
}
