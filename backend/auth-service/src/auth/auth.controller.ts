import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDTO } from './dto/request/signup.dto';
import { LoginDTO } from './dto/request/login.dto';
import { JwtAuthGuard } from './guard/base-auth-guard/jwt-auth.guard';
import { RouteConstants } from '../common/constant/route.constant';
import { AuthResponseDTO } from './dto/response/auth-response.dto';
import { SkipJwtAuth } from './decorator/skip-jwt-auth.decorator';
import { LoggedInUser } from '../common/decorator/logged-in-user.decorator';

@Controller(RouteConstants.AUTH_CONTROLLER)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
