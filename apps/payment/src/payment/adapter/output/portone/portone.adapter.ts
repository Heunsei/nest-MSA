import { PaymentDomain } from '../../../domain/payment.domain';
import { PaymentOutputPort } from '../../../port/output/payment.output-port';

export class PortoneAdapter implements PaymentOutputPort {
  async processPayment(payment: PaymentDomain[]): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  }
}
