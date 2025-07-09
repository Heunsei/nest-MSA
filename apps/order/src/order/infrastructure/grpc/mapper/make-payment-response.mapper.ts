import { PaymentMicroService } from '@app/common';
import { OrderEntity } from 'apps/order/src/order/domain/order.entity';
import { PaymentMethod } from 'apps/order/src/order/domain/payment.entity';
import { PaymentDto } from 'apps/order/src/order/usecase/dto/create-order.dto';

export class MakePaymentResponseMapper {
  constructor(
    private readonly response: PaymentMicroService.MakePaymentResponse,
  ) {}

  toDomain(order: OrderEntity, payment: PaymentDto): OrderEntity {
    order.setPayment({
      ...payment,
      ...this.response,
      paymentId: this.response.id,
      paymentMethod: this.parsePaymentMethod(payment.paymentMethod),
    });

    return order;
  }

  private parsePaymentMethod(paymentMethod: string) {
    switch (paymentMethod) {
      case 'CreditCard':
        return PaymentMethod.creditCard;
      case 'Kakao':
        return PaymentMethod.kakao;
      default:
        throw new Error('알 수 없는 결제 방식입니다.');
    }
  }
}
