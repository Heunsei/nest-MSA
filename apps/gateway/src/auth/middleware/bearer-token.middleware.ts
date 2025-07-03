import { USER_SERVICE, UserMicroService } from '@app/common';
import {
  Inject,
  Injectable,
  NestMiddleware,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware, OnModuleInit {
  authService: UserMicroService.AuthServiceClient;

  constructor(
    @Inject(USER_SERVICE)
    private readonly userMicroService: ClientGrpc,
  ) {}
  onModuleInit() {
    this.authService =
      this.userMicroService.getService<UserMicroService.AuthServiceClient>(
        'AuthService',
      );
  }

  async use(req: any, res: any, next: (error?: any) => void) {
    // rawToken 가져오기
    const token = this.getRawToken(req);

    if (!token) {
      next();
      return;
    }
    // User Auth에 토큰 던지기

    const payload = await this.verifyToken(token);

    // req.user payload 붙이기
    req.user = payload;
    next();
  }

  getRawToken(req: any): string | null {
    const authHeader = req.headers['authorization'];

    return authHeader;
  }

  async verifyToken(token: string) {
    const result = await lastValueFrom(
      this.authService.parseBearerToken({ token }),
    );

    return result;
  }
}
