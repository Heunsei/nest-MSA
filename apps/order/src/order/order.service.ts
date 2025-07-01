import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { USER_SERVICE } from '@app/common';

@Injectable()
export class OrderService {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: ClientProxy,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, token: string) {
    // 사용자 정보 가져오기
    const user = await this.getUserFromToken(token);
  }

  async getUserFromToken(token: string) {
    // USER - MS : jwtToken 검증
    const resp = await lastValueFrom(
      this.userService.send({ cmd: 'parse_bearer_token' }, { token }),
    );
    console.log(resp);
    // USER - MS : user 가져오기
  }
}
