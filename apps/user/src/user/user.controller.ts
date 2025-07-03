import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { UserMicroService } from '@app/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
@UserMicroService.UserServiceControllerMethods()
export class UserController implements UserMicroService.UserServiceController {
  constructor(private readonly userService: UserService) {}

  // @GrpcMethod('UserService')
  getUserInfo(request: UserMicroService.GetUserInfoRequest) {
    return this.userService.getUserById(request.userId);
  }
}
