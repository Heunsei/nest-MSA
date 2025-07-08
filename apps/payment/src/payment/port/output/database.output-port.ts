import { PaymentDomain } from '../../domain/payment.domain';

// 포트의 추상화를 이용하여 논리를 작성함
export interface DatabaseOutputPort {
  savePayment(payment: PaymentDomain[]): Promise<PaymentDomain>;

  updatePayment(payment: PaymentDomain): Promise<PaymentDomain>;
}
