import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { SendPaymentNotificationDto } from './dto/send-payment-notification.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationStatus } from './entity/notification.entity';
import { Model, Types } from 'mongoose';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import {
  constructMetadata,
  ORDER_SERVICE,
  OrderMicroService,
} from '@app/common';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class NotificationService implements OnModuleInit {
  orderService: OrderMicroService.OrderServiceClient;

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    // @Inject(ORDER_SERVICE)
    // private readonly orderService: ClientProxy,
    @Inject(ORDER_SERVICE)
    private readonly orderMicroservice: ClientGrpc,
  ) {}

  onModuleInit() {
    this.orderService =
      this.orderMicroservice.getService<OrderMicroService.OrderServiceClient>(
        'OrderService',
      );
  }

  async sendPaymentNotification(
    data: SendPaymentNotificationDto,
    metadata: Metadata,
  ) {
    const notification = await this.createNotification(data.to);

    await this.updateNotificationStatus(
      (notification._id as Types.ObjectId).toString(),
      NotificationStatus.sent,
    );

    this.sendDeliveryStartedMessage(data.orderId, metadata);

    return this.notificationModel.findById(notification._id);
  }

  async sendEmail() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // orderContoroller에 message 이벤트 전달
  sendDeliveryStartedMessage(id: string, metadata: Metadata) {
    this.orderService.deliveryStarted(
      { id },
      constructMetadata(
        NotificationService.name,
        'sendDeliveryStartedMessage',
        metadata,
      ),
    );
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
