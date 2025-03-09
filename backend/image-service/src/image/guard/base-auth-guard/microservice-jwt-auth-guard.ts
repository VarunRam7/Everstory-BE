import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';

import { ClientProxy } from '@nestjs/microservices';

import { lastValueFrom } from 'rxjs';
import { EventConstants } from '../../../common/constant/event.constant';

@Injectable()
export class MicroserviceJwtAuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      return false;
    }

    try {
      const user = await lastValueFrom(
        this.authClient.send(EventConstants.VERIFY_JWT, token),
      );
      request.user = user;
      return true;
    } catch (error) {
      return false;
    }
  }
}
