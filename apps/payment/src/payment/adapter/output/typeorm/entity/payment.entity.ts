import {
  NotificationStatus,
  PaymentMethod,
  PaymentStatus,
} from 'apps/payment/src/payment/domain/payment.domain';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.pending,
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.creditCard,
  })
  paymentMethod: PaymentMethod;

  @Column()
  cardNumber: string;

  @Column()
  expiryYear: string;

  @Column()
  expiryMonth: string;

  @Column()
  birthOrRegistration: string;

  @Column()
  passwordTwoDigits: string;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.pending,
  })
  notificationStatus: NotificationStatus;

  @Column()
  orderId: string;

  @Column()
  amount: number;

  @Column()
  userEmail: string;
}
