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
      return user;
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

    try {
      this.logger.log(`Attempting to fetch posts for user :: ${userId}`);
      const response = await lastValueFrom(
        this.imageServiceClient.send(EventConstants.GET_USER_POSTS, { userId }),
      );

      this.logger.log(`Fetched posts successfully for user :: ${userId}`);

      if (user.isPrivate) {
        return new UserDetailedDTO(user, response.totalCount);
      } else {
        return new UserDetailedDTO(user, response.totalCount, response.posts);
      }
    } catch (eventError) {
      this.logger.error(
        `Error sending get event to image-service:`,
        eventError,
      );
      throw eventError;
    }
  }
}
