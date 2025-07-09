import { Controller, UseInterceptors } from '@nestjs/common';
import { OrderMicroService } from '@app/common';
import { Metadata } from '@grpc/grpc-js';
import { GrpcInterceptor } from '@app/common/const/interceptor/grpc.interceptor';
import { CreateOrderUseCase } from '../../usecase/create-order.usecase';
import { CreateOrderRequestMapper } from './mapper/create-order-request.mapper';
import { StartDeliveryUseCase } from '../../usecase/start-delivery.usecase';

@Controller('order')
@OrderMicroService.OrderServiceControllerMethods()
@UseInterceptors(GrpcInterceptor)
export class OrderController
  implements OrderMicroService.OrderServiceController
{
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly startDeliveryUseCase: StartDeliveryUseCase,
  ) {}

  async deliveryStarted(request: OrderMicroService.DeliveryStartedRequest) {
    await this.startDeliveryUseCase.execute(request.id);
  }

  // @ts-ignore
  async createOrder(
    request: OrderMicroService.CreateOrderRequest,
    metadata: Metadata,
  ) {
    return this.createOrderUseCase.execute(
      new CreateOrderRequestMapper(request).toDomain(),
    );
  }
}
