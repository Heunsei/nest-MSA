import { OrderOutputPort } from '../port/output/order.output-port';

export class StartDeliveryUserCase {
  constructor(private readonly orderOutputPort: OrderOutputPort) {}
  async execute(orderId: string) {
    const order = await this.orderOutputPort.getOrder(orderId);

    order.startDelivery();
    await this.orderOutputPort.updateOrder(order);

    return order;
  }
}
