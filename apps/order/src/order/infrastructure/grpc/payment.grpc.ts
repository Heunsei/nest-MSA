import { PAYMENT_SERVICE, PaymentMicroService } from '@app/common';
import { OrderEntity, OrderStatus } from '../../domain/order.entity';
import { PaymentOutputPort } from '../../port/output/payment.output-port';
import { Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { OrderEntityMapper } from './mapper/order-entity.mapper';
import { PaymentFailedException } from '../../exception/payment-failed.exception';
import { MakePaymentResponseMapper } from './mapper/make-payment-response.mapper';
import { PaymentDto } from '../../usecase/dto/create-order.dto';

export class PaymentGrpc implements PaymentOutputPort, OnModuleInit {
  paymentService: PaymentMicroService.PaymentServiceClient;

  constructor(
    @Inject(PAYMENT_SERVICE)
    private readonly paymentMicroService: ClientGrpc,
  ) {}

  onModuleInit() {
    this.paymentService =
      this.paymentMicroService.getService<PaymentMicroService.PaymentServiceClient>(
        'PaymentService',
      );
  }

  async processPayment(
    order: OrderEntity,
    payment: PaymentDto,
  ): Promise<OrderEntity> {
    const resp = await lastValueFrom(
      this.paymentService.makePayment(
        new OrderEntityMapper(order).toMakePaymentRequest(payment),
      ),
    );

    const isPaid = resp.paymentStatus === 'Approved';
    const orderStatus = isPaid
      ? OrderStatus.paymentProcessed
      : OrderStatus.paymentFailed;

    if (orderStatus === OrderStatus.paymentFailed) {
      throw new PaymentFailedException(resp);
    }

    return new MakePaymentResponseMapper(resp).toDomain(order, payment);
  }
}
