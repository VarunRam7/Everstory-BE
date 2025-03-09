import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Param,
  UnauthorizedException,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDTO } from './dto/request/signup.dto';
import { LoginDTO } from './dto/request/login.dto';
import { JwtAuthGuard } from './guard/base-auth-guard/jwt-auth.guard';
import { RouteConstants } from '../common/constant/route.constant';
import { AuthResponseDTO } from './dto/response/auth-response.dto';
import { SkipJwtAuth } from './decorator/skip-jwt-auth.decorator';
import { LoggedInUser } from '../common/decorator/logged-in-user.decorator';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventConstants } from '../common/constant/event.constant';
import { JwtService } from '@nestjs/jwt';

@Controller(RouteConstants.AUTH_CONTROLLER)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post(RouteConstants.SIGNUP)
  @SkipJwtAuth()
  async signup(@Body() signupDTO: SignupDTO): Promise<AuthResponseDTO> {
    return this.authService.signup(signupDTO);
  }

  @Post(RouteConstants.LOGIN)
  @SkipJwtAuth()
  async login(@Body() loginDTO: LoginDTO): Promise<AuthResponseDTO> {
    return this.authService.login(loginDTO);
  }

  @Get(RouteConstants.PROFILE)
  @UseGuards(JwtAuthGuard)
  async getProfile(@LoggedInUser() loggedInUser: AuthResponseDTO) {
    return this.authService.findByEmail(loggedInUser.getEmail());
  }

  @Patch(RouteConstants.PRIVACY)
  @UseGuards(JwtAuthGuard)
  async updatePrivacySettings(
    @Body('isPrivate') isPrivate: boolean,
    @LoggedInUser() loggedInUser: AuthResponseDTO,
  ) {
    return this.authService.updatePrivacySettings(
      isPrivate,
      loggedInUser.getId(),
    );
  }

  @MessagePattern(EventConstants.REMOVE_PROFILE_PHOTO)
  async handleRemoveProfilePhoto(@Payload() data: { email: string }) {
    const { email } = data;
    return await this.authService.updateProfilePhoto(email, '');
  }

  @MessagePattern(EventConstants.UPDATE_PROFILE_PHOTO)
  async handleUpdateProfilePhoto(
    @Payload() data: { email: string; profilePhotoUrl: string },
  ) {
    const { email, profilePhotoUrl } = data;
    return await this.authService.updateProfilePhoto(email, profilePhotoUrl);
  }

  @Get(RouteConstants.GET_ALL_USERS)
  @UseGuards(JwtAuthGuard)
  async fetchUsers(
    @LoggedInUser() loggedInUser: AuthResponseDTO,
    @Query('searchString') searchString?: string,
  ) {
    return this.authService
      .fetchUsers(searchString, loggedInUser, true)
      .catch((error) => {
        throw error;
      });
  }

  @Get(RouteConstants.GET_USER_DETAILS_BY_ID)
  @UseGuards(JwtAuthGuard)
  async getUserDetailsById(
    @Param('userId') userId: string,
    @LoggedInUser() loggedInUser: AuthResponseDTO,
  ) {
    return this.authService
      .getUserDetailsById(userId, loggedInUser)
      .catch((error) => {
        throw error;
      });
  }

  @MessagePattern(EventConstants.GET_FOLLOW_REQUEST_DETAILS)
  async getFollowRequestUsersDetails(
    @Payload() data: { requestBy: string; requestTo: string },
  ) {
    const { requestBy, requestTo } = data;
    return await this.authService.getMultipleUserMinimalDetailsById(
      requestBy,
      requestTo,
    );
  }

  @MessagePattern(EventConstants.GET_PUBLIC_ACCOUNTS)
  async getPublicAccounts() {
    return await this.authService.getPublicAccounts();
  }

  @MessagePattern(EventConstants.GET_USER_DETAILS_BY_IDS)
  async getUserMinimalDetailsForIds(@Payload() data: { userIds: string[] }) {
    const { userIds } = data;
    return await this.authService.getUserMinimalDetailsForIds(userIds);
  }

  @MessagePattern(EventConstants.VERIFY_JWT)
  async verifyJwt(@Payload() token: string) {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid Token');
    }
  }
}
