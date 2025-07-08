import { InjectModel } from '@nestjs/mongoose';
import { PaymentDomain } from '../../../domain/payment.domain';
import { DatabaseOutputPort } from '../../../port/output/database.output-port';
import { PaymentDocument } from './document/payment.document';
import { Model } from 'mongoose';
import { PaymentDocumentMapper } from './mapper/payment-document.mapper';

export class MongooseAdapter implements DatabaseOutputPort {
  constructor(
    @InjectModel(PaymentDocument.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  async savePayment(payment: PaymentDomain[]): Promise<PaymentDomain> {
    const model = await this.paymentModel.create(payment);

    // @ts-ignore
    return new PaymentDocumentMapper(model).toDomain();
  }
  async updatePayment(payment: PaymentDomain): Promise<PaymentDomain> {
    const model = await this.paymentModel.findByIdAndUpdate(
      payment.id,
      payment,
      {
        new: true,
      },
    );

    if (!model) {
      throw new Error();
    }

    return new PaymentDocumentMapper(model).toDomain();
  }
}
