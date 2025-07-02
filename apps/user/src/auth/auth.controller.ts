import {
  Body,
  Controller,
  UnauthorizedException,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { ParseBearerTokenDto } from './dto/parse-bearer-token.dto';
import { RpcInterceptor } from '@app/common/const/interceptor/rpc.interceotor';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // micro service 에서 제공해주는 메세지를 받을 수 있는 방법
  @MessagePattern(
    {
      cmd: 'parse_bearer_token',
    },
    Transport.TCP,
  )
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  parseBearerToken(@Payload() payload: ParseBearerTokenDto) {
    return this.authService.parseBearerToken(payload.token, false);
  }

  @MessagePattern({
    cmd: 'register',
  })
  registerUser(@Payload() registerDto: RegisterDto) {
    const { token } = registerDto;

    if (registerDto.token === null) {
      throw new UnauthorizedException('토큰을 입력해주세요');
    }

    return this.authService.register(token, registerDto);
  }

  @MessagePattern({ cmd: 'login' })
  loginUser(@Payload() loginDto: LoginDto) {
    const { token } = loginDto;

    if (token === null) {
      throw new UnauthorizedException('토큰을 입력해주세요');
    }

    return this.authService.login(token);
  }
}
