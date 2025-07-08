import { Controller, UseInterceptors } from '@nestjs/common';
import { PaymentMicroService } from '@app/common';
import { Metadata } from '@grpc/grpc-js';
import { GrpcInterceptor } from '@app/common/const/interceptor/grpc.interceptor';
import { PaymentService } from '../../application/payment.service';
import { PaymentMethod } from '../../domain/payment.domain';

@Controller()
@PaymentMicroService.PaymentServiceControllerMethods()
@UseInterceptors(GrpcInterceptor)
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
