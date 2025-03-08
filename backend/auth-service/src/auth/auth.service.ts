import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { comparePasswords, hashPassword } from '../common/util/crypto.util';

import { AuthResponseDTO } from './dto/response/auth-response.dto';
import { CreateUserDTO } from './dto/request/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO } from './dto/request/login.dto';
import { SignupDTO } from './dto/request/signup.dto';
import { UserMinimalDTO } from './dto/response/user-minimal.dto';
import { UserRepository } from './user.repository';
import { isEmpty } from 'lodash';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { EventConstants } from '../common/constant/event.constant';
import { UserDetailedDTO } from './dto/response/user-deatiled.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    @Inject('IMAGE_SERVICE') private readonly imageServiceClient: ClientProxy,
    @Inject('FRIENDSHIP_SERVICE')
    private readonly friendshipServiceClient: ClientProxy,
  ) {}
  private readonly logger = new Logger(AuthService.name);

  async signup(signupDTO: SignupDTO) {
    const hashedPassword = await hashPassword(signupDTO.password);

    const createUserDTO = new CreateUserDTO(
      signupDTO.firstName,
      signupDTO.lastName,
      signupDTO.email,
      hashedPassword,
    );

    try {
      const user = await this.userRepository.createUser(createUserDTO);
      this.logger.log(
        `Successfully created a new user with email :: ${createUserDTO.getEmail()}`,
      );

      const payload = {
        email: user.email,
        sub: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id,
      };
      const accessToken = this.jwtService.sign(payload);

      return new AuthResponseDTO(user, accessToken);
    } catch (error) {
      this.logger.error(
        `Error while attempting to create a user for email :: ${signupDTO.email} | Error :: ${error}`,
      );
      throw new Error('Signup failed');
    }
  }

  async login(loginDTO: LoginDTO) {
    try {
      const user = await this.userRepository.findByEmail(loginDTO.email);
      if (!user) {
        this.logger.warn(`User not found with email: ${loginDTO.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const passwordMatches = await comparePasswords(
        loginDTO.password,
        user.password,
      );
      if (!passwordMatches) {
        this.logger.warn(`Incorrect password for email: ${loginDTO.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.log(`Logged in successfully for email :: ${loginDTO.email}`);

      const payload = {
        email: user.email,
        sub: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id,
      };
      const accessToken = this.jwtService.sign(payload);

      return new AuthResponseDTO(user, accessToken);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(
        `Error while attempting to login for email :: ${loginDTO.email} | Error :: ${error.message}`,
      );
      throw new InternalServerErrorException('Login Failed');
    }
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (user) {
      this.logger.log(`Successfully found user for email :: ${email}`);
      let followerFollowingCount;
      try {
        this.logger.log(
          `Attempting to send event to friendship service to find follow count details for user :: ${user.id.toString()} `,
        );
        followerFollowingCount = await lastValueFrom(
          this.friendshipServiceClient.send(EventConstants.FOLLOW_COUNT, {
            userId: user.id.toString(),
          }),
        );
        this.logger.log(
          `Fetched follow count details from friendship service for user :: ${user.id.toString()}`,
        );
      } catch (eventError) {
        this.logger.error(
          `Error sending get event to friendship-service:`,
          eventError,
        );
        throw eventError;
      }
      return {
        ...user.toObject(),
        followers: followerFollowingCount.followers || 0,
        following: followerFollowingCount.following || 0,
      };
    }
    throw new BadRequestException(`No user found with email :: ${email}`);
  }

  async updateProfilePhoto(email: string, profilePhotoUrl: string) {
    this.logger.log(
      `Attempting to ${isEmpty(profilePhotoUrl) ? 'remove' : 'update'} profile photo for email :: ${email}`,
    );
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        this.logger.warn(`User not found with email: ${email}`);
        throw new BadRequestException(`No user found with email :: ${email}`);
      }

      await this.userRepository.updateUserByEmail(email, {
        profilePhoto: !isEmpty(profilePhotoUrl) ? profilePhotoUrl : null,
      });

      this.logger.log(
        `Successfully updated profile photo for user with email :: ${email}`,
      );
      return {
        message: `Profile photo ${!isEmpty(profilePhotoUrl) ? 'updated' : 'removed'} successfully`,
        profilePhotoUrl,
      };
    } catch (error) {
      this.logger.error(
        `Error while updating profile photo for email :: ${email} | Error :: ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to update profile photo');
    }
  }

  async fetchUsers(
    searchString?: string,
    loggedInUser?: AuthResponseDTO,
    discardMe = false,
  ) {
    try {
      let response = await this.userRepository.fetchUsers(searchString);

      if (discardMe) {
        response = response.filter((res) => {
          return res._id.toString() !== loggedInUser?.getId().toString();
        });
      }

      if (response.length === 0) this.logger.log(`No users found`);
      else this.logger.log(`${response.length} users found`);
      return response.map((user) => new UserMinimalDTO(user));
    } catch (error) {
      this.logger.error(`Error fetching users: ${error.message}`);
      throw new Error('Failed to fetch users');
    }
  }

  async getUserDetailsById(
    userId: string,
    loggedInUser: AuthResponseDTO,
  ): Promise<UserMinimalDTO | UserDetailedDTO> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    this.logger.log(`Fetching user details for user :: ${userId}`);

    const [
      userPostsResult,
      isFollowingResult,
      isRequestedResult,
      followerFollowingCountResult,
    ] = await Promise.allSettled([
      lastValueFrom(
        this.imageServiceClient.send(EventConstants.GET_USER_POSTS, {
          userId,
        }),
      ),
      lastValueFrom(
        this.friendshipServiceClient.send(EventConstants.IS_FOLLOWING, {
          followedBy: loggedInUser.getId().toString(),
          followed: userId.toString(),
        }),
      ),
      lastValueFrom(
        this.friendshipServiceClient.send(EventConstants.IS_REQUESTED, {
          followedBy: loggedInUser.getId().toString(),
          followed: userId.toString(),
        }),
      ),
      lastValueFrom(
        this.friendshipServiceClient.send(EventConstants.FOLLOW_COUNT, {
          userId,
        }),
      ),
    ]);

    const userPosts =
      userPostsResult.status === 'fulfilled'
        ? (userPostsResult.value as { totalCount: number; posts: any[] })
        : { totalCount: 0, posts: [] };

    const isFollowing =
      isFollowingResult.status === 'fulfilled'
        ? (isFollowingResult.value as boolean)
        : false;

    const isRequested =
      isRequestedResult.status === 'fulfilled'
        ? (isRequestedResult.value as boolean)
        : false;

    const followerFollowingCount =
      followerFollowingCountResult.status === 'fulfilled'
        ? (followerFollowingCountResult.value as {
            followers: number;
            following: number;
          })
        : { followers: 0, following: 0 };

    if (userPostsResult.status === 'rejected') {
      this.logger.error(`Error fetching posts:`, userPostsResult.reason);
    }
    if (isFollowingResult.status === 'rejected') {
      this.logger.error(
        `Error checking follow status:`,
        isFollowingResult.reason,
      );
    }
    if (isRequestedResult.status === 'rejected') {
      this.logger.error(
        `Error checking request status:`,
        isRequestedResult.reason,
      );
    }

    if (followerFollowingCountResult.status === 'rejected') {
      this.logger.error(
        `Error fetching follower/following count:`,
        followerFollowingCountResult.reason,
      );
    }

    return new UserDetailedDTO(
      user,
      userPosts.totalCount,
      user.isPrivate && !isFollowing ? [] : userPosts.posts,
      user.isPrivate ? isFollowing : true,
      isRequested ? true : false,
      followerFollowingCount.followers,
      followerFollowingCount.following,
    );
  }

  async getMultipleUserMinimalDetailsById(
    userId1: string,
    userId2: string,
  ): Promise<UserMinimalDTO[]> {
    const [user1, user2] = await Promise.all([
      this.userRepository.findUserById(userId1),
      this.userRepository.findUserById(userId2),
    ]);

    if (!user1 || !user2) {
      throw new BadRequestException('One or both users not found');
    }

    return [new UserMinimalDTO(user1), new UserMinimalDTO(user2)];
  }
}
