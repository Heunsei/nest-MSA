import { Inject, OnModuleInit } from '@nestjs/common';
import { NetworkOutputPort } from '../../../port/output/network.output-port';
import { NOTIFICATION_SERVICE, NotificationMicroService } from '@app/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

export class GrpcAdapter implements NetworkOutputPort, OnModuleInit {
  notificationService: NotificationMicroService.NotificationServiceClient;

  constructor(
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationMicroservice: ClientGrpc,
  ) {}

  onModuleInit() {
    this.notificationService =
      this.notificationMicroservice.getService<NotificationMicroService.NotificationServiceClient>(
        'NotificationService',
      );
  }

  async sendNotification(orderId: string, to: string) {
    await lastValueFrom(
      this.notificationService.sendPaymentNotification({
        to,
        orderId,
      }),
    );
  }
}
