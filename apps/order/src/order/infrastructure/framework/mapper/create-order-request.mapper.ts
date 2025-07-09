import { OrderMicroService } from '@app/common';
import { CreateOrderDto } from '../../../usecase/dto/create-order.dto';
import { PaymentMethod } from '../../../domain/payment.entity';

export class CreateOrderRequestMapper {
  constructor(
    private readonly createRequest: OrderMicroService.CreateOrderRequest,
  ) {}

  toDomain(): CreateOrderDto {
    return {
      userId: this.createRequest.meta!.user!.sub,
      productIds: this.createRequest.productIds,
      address: this.createRequest.address!,
      payment: {
        ...this.createRequest.payment!,
        paymentMethod: this.parsePaymentMethod(
          this.createRequest.payment!.paymentMethod,
        ),
      },
    };
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
