import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientProxy } from '@nestjs/microservices';
import { ORDER_SERVICE, UserMeta, UserPayloadDto } from '@app/common';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderMicroService: ClientProxy,
  ) {}

  async createOrder(
    createOrderDto: CreateOrderDto,
    userPayload: UserPayloadDto,
  ) {
    // 반환타입 any 보낼타입 CreateOrderDto 및 UserMeta 데이터 타입
    return this.orderMicroService.send<any, CreateOrderDto & UserMeta>(
      { cmd: 'create_order' },
      {
        ...createOrderDto,
        // 정규화된 형태로 데이터를 전달할때 전달 방법
        meta: {
          user: userPayload,
        },
      },
    );
  }
}
