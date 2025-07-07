import { Controller, UseInterceptors } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationMicroService } from '@app/common';
import { Metadata } from '@grpc/grpc-js';
import { GrpcInterceptor } from '@app/common/const/interceptor/grpc.interceptor';

@Controller()
@NotificationMicroService.NotificationServiceControllerMethods()
@UseInterceptors(GrpcInterceptor)
export class NotificationController
  implements NotificationMicroService.NotificationServiceController
{
  constructor(private readonly notificationService: NotificationService) {}

  async sendPaymentNotification(
    request: NotificationMicroService.SendPaymentNotificationRequest,
    metadata: Metadata,
  ) {
    const resp = (await this.notificationService.sendPaymentNotification(
      request,
      metadata,
    ))!.toJSON();
    return {
      ...resp,
      status: resp.status.toString(),
    };
  }
}
