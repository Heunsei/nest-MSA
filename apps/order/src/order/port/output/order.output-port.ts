import { OrderEntity } from '../../domain/order.entity';

export interface OrderOutputPort {
  createOrder(order: OrderEntity): Promise<OrderEntity>;

  updateOrder(order: OrderEntity): Promise<OrderEntity>;

  getOrder(orderId: string): Promise<OrderEntity>;
}
