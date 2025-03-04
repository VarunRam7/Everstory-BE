import {
  BadRequestException,
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
import { UserRepository } from './user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
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

      const payload = { email: user.email, sub: user._id, role: user.role };
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

      const payload = { email: user.email, sub: user._id, role: user.role };
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
}
