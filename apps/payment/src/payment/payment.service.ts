import { Inject, Injectable } from '@nestjs/common';
import { MakePaymentDto } from './dto/make-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, PaymentStatus } from './entity/payment.entity';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { NOTIFICATION_SERVICE } from '@app/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: ClientProxy,
  ) {}

  async makePayment(payload: MakePaymentDto) {
    let paymentId;
    try {
      const result = await this.paymentRepository.save(payload);

      paymentId = result.id;

      // 1초동안 대기
      await this.processPayment();

      // Payment 수정
      await this.updatePaymentStatus(result.id, PaymentStatus.approved);

      // TODO notification 전달
      this.sendNotification(payload.orderId, payload.userEmail);

      return this.paymentRepository.findOneBy({ id: result.id });
    } catch (e) {
      if (paymentId) {
        await this.updatePaymentStatus(paymentId, PaymentStatus.rejected);
      }
      throw e;
    }
  }

  async processPayment() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    await this.paymentRepository.update({ id }, { paymentStatus });
  }

  async sendNotification(orderId: string, to: string) {
    const resp = await lastValueFrom(
      this.notificationService.send(
        { cmd: 'send_payment_notification' },
        {
          to,
          orderId,
        },
      ),
    );
  }
}
