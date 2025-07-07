import { Controller, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UserMicroService } from '@app/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GrpcInterceptor } from '@app/common/const/interceptor/grpc.interceptor';

@Controller()
@UserMicroService.UserServiceControllerMethods()
@UseInterceptors(GrpcInterceptor)
export class UserController implements UserMicroService.UserServiceController {
  constructor(private readonly userService: UserService) {}

  // @GrpcMethod('UserService')
  getUserInfo(request: UserMicroService.GetUserInfoRequest) {
    return this.userService.getUserById(request.userId);
  }
}
