import { Inject, Injectable } from '@nestjs/common';
import { SendPaymentNotificationDto } from './dto/send-payment-notification.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationStatus } from './entity/notification.entity';
import { Model, Types } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { ORDER_SERVICE } from '@app/common';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    @Inject(ORDER_SERVICE)
    private readonly orderService: ClientProxy,
  ) {}
  async sendPaymentNotification(data: SendPaymentNotificationDto) {
    const notification = await this.createNotification(data.to);

    await this.updateNotificationStatus(
      (notification._id as Types.ObjectId).toString(),
      NotificationStatus.sent,
    );

    this.sendDeliveryStartedMessage(data.orderId);

    return this.notificationModel.findById(notification._id);
  }

  async sendEmail() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  sendDeliveryStartedMessage(id: string) {
    this.orderService.emit({ cmd: 'delivery_started' }, id);
  }

  async updateNotificationStatus(id: string, status: NotificationStatus) {
    return this.notificationModel.findByIdAndUpdate(id, { status });
  }

  async createNotification(to: string) {
    return await this.notificationModel.create({
      from: 'test@naver.com',
      to,
      subject: '배송이 시작되었습니다',
      content: `${to}님 주문하신 물건이 배송 시작되었습니다`,
    });
  }
}
