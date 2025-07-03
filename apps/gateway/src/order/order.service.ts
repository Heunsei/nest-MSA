import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import {
  ORDER_SERVICE,
  OrderMicroService,
  UserMeta,
  UserPayloadDto,
} from '@app/common';

@Injectable()
export class OrderService implements OnModuleInit {
  orderService: OrderMicroService.OrderServiceClient;

  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderMicroService: ClientGrpc,
  ) {}

  onModuleInit() {
    this.orderService =
      this.orderMicroService.getService<OrderMicroService.OrderServiceClient>(
        'OrderService',
      );
  }

  async createOrder(
    createOrderDto: CreateOrderDto,
    userPayload: UserPayloadDto,
  ) {
    // 반환타입 any 보낼타입 CreateOrderDto 및 UserMeta 데이터 타입
    return this.orderService.createOrder({
      ...createOrderDto,
      // 정규화된 형태로 데이터를 전달할때 전달 방법
      meta: {
        user: userPayload,
      },
    });
  }
}
