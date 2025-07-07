import { Controller, UseInterceptors } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentMicroService } from '@app/common';
import { PaymentMethod } from './entity/payment.entity';
import { Metadata } from '@grpc/grpc-js';
import { GrpcInterceptor } from '@app/common/const/interceptor/grpc.interceptor';

@Controller()
@PaymentMicroService.PaymentServiceControllerMethods()
@UseInterceptors(GrpcInterceptor)
export class PaymentController
  implements PaymentMicroService.PaymentServiceController
{
  constructor(private readonly paymentService: PaymentService) {}

  // @ts-ignore
  makePayment(
    request: PaymentMicroService.MakePaymentRequest,
    metadata: Metadata,
  ) {
    return this.paymentService.makePayment(
      {
        ...request,
        paymentMethod: request.paymentMethod as PaymentMethod,
      },
      metadata,
    );
  }
}
