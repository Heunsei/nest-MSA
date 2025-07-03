import { Controller, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserMicroService } from '@app/common';

@Controller('auth')
@UserMicroService.AuthServiceControllerMethods()
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

  loginUser(request: UserMicroService.LoginUserRequest) {
    const { token } = request;

    if (token === null) {
      throw new UnauthorizedException('토큰을 입력해주세요');
    }

    return this.authService.login(token);
  }
}
