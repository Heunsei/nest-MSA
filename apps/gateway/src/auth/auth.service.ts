import { USER_SERVICE, UserMicroService } from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { Metadata } from '@grpc/grpc-js';
import { constructMetadata } from '@app/common/grpc/utils/construct-metadata.utils';

@Injectable()
export class AuthService implements OnModuleInit {
  // user는 auth랑 user가 두개 존재
  authService: UserMicroService.AuthServiceClient;
  constructor(
    @Inject(USER_SERVICE)
    private readonly userMicroservice: ClientGrpc,
  ) {}
  onModuleInit() {
    this.authService =
      this.userMicroservice.getService<UserMicroService.AuthServiceClient>(
        'AuthService',
      );
  }

  register(token: string, registerDto: RegisterDto) {
    return lastValueFrom(
      this.authService.registerUser(
        {
          ...registerDto,
          token,
        },
        constructMetadata(AuthService.name, 'register'),
      ),
    );
  }

  login(token: string) {
    return lastValueFrom(
      this.authService.loginUser(
        {
          token,
        },
        constructMetadata(AuthService.name, 'login'),
      ),
    );
  }
}
