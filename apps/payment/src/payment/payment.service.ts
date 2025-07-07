import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { MakePaymentDto } from './dto/make-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, PaymentStatus } from './entity/payment.entity';
import { Repository } from 'typeorm';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import {
  constructMetadata,
  NOTIFICATION_SERVICE,
  NotificationMicroService,
} from '@app/common';
import { lastValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class PaymentService implements OnModuleInit {
  // 요청을 보내는 서버는 클라이언트로
  notificationService: NotificationMicroService.NotificationServiceClient;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    // @Inject(NOTIFICATION_SERVICE)
    // private readonly notificationService: ClientProxy,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationMicroservice: ClientGrpc,
  ) {}

  onModuleInit() {
    this.notificationService =
      this.notificationMicroservice.getService<NotificationMicroService.NotificationServiceClient>(
        'NotificationService',
      );
  }

  async makePayment(payload: MakePaymentDto, metadata: Metadata) {
    let paymentId;
    try {
      const result = await this.paymentRepository.save(payload);

      paymentId = result.id;

      // 1초동안 대기
      await this.processPayment();

      // Payment 수정
      await this.updatePaymentStatus(result.id, PaymentStatus.approved);

      // TODO notification 전달
      this.sendNotification(payload.orderId, payload.userEmail, metadata);

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

  async sendNotification(orderId: string, to: string, metadata: Metadata) {
    const resp = await lastValueFrom(
      this.notificationService.sendPaymentNotification(
        {
          to,
          orderId,
        },
        constructMetadata(PaymentService.name, 'sendNotification', metadata),
      ),
    );
  }
}
