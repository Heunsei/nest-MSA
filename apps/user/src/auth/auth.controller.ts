import {
  Controller,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserMicroService } from '@app/common';
import { Metadata } from '@grpc/grpc-js';
import { GrpcInterceptor } from '@app/common/const/interceptor/grpc.interceptor';

@Controller('auth')
@UserMicroService.AuthServiceControllerMethods()
@UseInterceptors(GrpcInterceptor)
export class AuthController implements UserMicroService.AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  // micro service 에서 제공해주는 메세지를 받을 수 있는 방법
  parseBearerToken(request: UserMicroService.ParseBearerTokenRequest) {
    return this.authService.parseBearerToken(request.token, false);
  }

  // @ts-ignore
  registerUser(request: UserMicroService.RegisterUserRequest) {
    const { token } = request;

    if (request.token === null) {
      throw new UnauthorizedException('토큰을 입력해주세요');
    }

    return this.authService.register(token, request);
  }

  loginUser(request: UserMicroService.LoginUserRequest, metadata: Metadata) {
    console.log(metadata);

    const { token } = request;

    if (token === null) {
      throw new UnauthorizedException('토큰을 입력해주세요');
    }

    return this.authService.login(token);
  }
}
