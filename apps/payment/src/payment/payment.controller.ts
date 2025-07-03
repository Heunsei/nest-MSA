import {
  Controller,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentMicroService } from '@app/common';
import { PaymentMethod } from './entity/payment.entity';

@Controller()
@PaymentMicroService.PaymentServiceControllerMethods()
export class PaymentController
  implements PaymentMicroService.PaymentServiceController
{
  constructor(private readonly paymentService: PaymentService) {}

  // @ts-ignore
  makePayment(request: PaymentMicroService.MakePaymentRequest) {
    return this.paymentService.makePayment({
      ...request,
      paymentMethod: request.paymentMethod as PaymentMethod,
    });
  }
}
