import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationMicroService } from '@app/common';

@Controller()
@NotificationMicroService.NotificationServiceControllerMethods()
export class NotificationController
  implements NotificationMicroService.NotificationServiceController
{
  constructor(private readonly notificationService: NotificationService) {}

  async sendPaymentNotification(
    request: NotificationMicroService.SendPaymentNotificationRequest,
  ) {
    const resp = (await this.notificationService.sendPaymentNotification(
      request,
    ))!.toJSON();
    return {
      ...resp,
      status: resp.status.toString(),
    };
  }
}
