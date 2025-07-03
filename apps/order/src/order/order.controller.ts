import { Controller } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderMicroService } from '@app/common';
import { OrderStatus } from './entity/order.entity';
import { PaymentMethod } from './entity/payment.entity';

@Controller('order')
@OrderMicroService.OrderServiceControllerMethods()
export class OrderController
  implements OrderMicroService.OrderServiceController
{
  constructor(private readonly orderService: OrderService) {}

  // @Post()
  // @UsePipes(ValidationPipe)
  // async createOrder(
  //   @Authorization() token: string,
  //   @Body() createOrderDto: CreateOrderDto,
  // ) {
  //   return this.orderService.createOrder(createOrderDto, token);
  // }

  async deliveryStarted(request: OrderMicroService.DeliveryStartedRequest) {
    await this.orderService.changeOrderStatus(
      request.id,
      OrderStatus.deliveryStarted,
    );
  }

  // @ts-ignore
  async createOrder(request: OrderMicroService.CreateOrderRequest) {
    return this.orderService.createOrder({
      ...request,
      // @ts-ignore
      payment: {
        ...request.payment,
        paymentMethod: request.payment!.paymentMethod as PaymentMethod,
      },
    });
  }
}
