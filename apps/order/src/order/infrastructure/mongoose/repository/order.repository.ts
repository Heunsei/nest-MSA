import { Model } from 'mongoose';
import { OrderEntity } from '../../../domain/order.entity';
import { OrderOutputPort } from '../../../port/output/order.output-port';
import { OrderDocument } from '../entity/order.entity';
import { InjectModel } from '@nestjs/mongoose';
import { OrderDocumentMapper } from '../mapper/order-document.mapper';

export class OrderRepository implements OrderOutputPort {
  constructor(
    @InjectModel(OrderDocument.name)
    private readonly orderRepository: Model<OrderDocument>,
  ) {}

  async createOrder(order: OrderEntity): Promise<OrderEntity> {
    const result = await this.orderRepository.create(order);

    return new OrderDocumentMapper(result).toDomain();
  }

  async updateOrder(order: OrderEntity): Promise<OrderEntity> {
    const { id, ...rest } = order;

    const result = await this.orderRepository.findByIdAndUpdate(id, rest);

    if (!result) {
      throw new Error(`${id}는 존재하지 않는 주문 id 입니다`);
    }

    return new OrderDocumentMapper(result).toDomain();
  }

  async getOrder(orderId: string): Promise<OrderEntity> {
    const result = await this.orderRepository.findById(orderId);

    if (!result) {
      throw new Error(`${orderId}는 존재하지 않는 아이디입니다.`);
    }

    return new OrderDocumentMapper(result).toDomain();
  }
}
