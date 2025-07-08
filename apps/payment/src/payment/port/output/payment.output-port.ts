import { PaymentDomain } from '../../domain/payment.domain';

export interface PaymentOutputPort {
  processPayment(payment: PaymentDomain[]): Promise<boolean>;
}
