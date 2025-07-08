import { OrderEntity } from '../domain/order.entity';
import { OrderOutputPort } from '../port/output/order.output-port';
import { PaymentOutputPort } from '../port/output/payment.output-port';
import { ProductOutputPort } from '../port/output/product.output-port';
import { UserOutputPort } from '../port/output/user.output-port';
import { CreateOrderDto } from './dto/create-order.dto';

export class CreateOrderUseCase {
  constructor(
    private readonly userOutputPort: UserOutputPort,
    private readonly productOutputPort: ProductOutputPort,
    private readonly orderOutputPort: OrderOutputPort,
    private readonly paymentOutputPort: PaymentOutputPort,
  ) {}
  async execute(dto: CreateOrderDto) {
    // 1. User 값을 가져온다 - User
    const user = await this.userOutputPort.getUserById(dto.userId);
    // 2. Product 정보를 가져온다 - Product
    const products = await this.productOutputPort.getProductsByIds(
      dto.productIds,
    );
    // 3. 주문 생성 - Order
    const order = new OrderEntity({
      customer: user,
      products: products,
      deliveryAddress: dto.address,
    });
    // 4. 총액 계산 - totalAmount
    order.calculateTotalAmount();
    // 5. 생성된 주문을 DB에 저장 - Order
    const result = await this.orderOutputPort.createOrder(order);
    // 6. 생성된 주문 ID 저장 - Order
    order.setId(result.id);
    try {
      // 7. 결제 진행 - Payment
      const paymentResult = await this.paymentOutputPort.processPayment(
        order,
        dto.payment,
      );
      // 8. 결제 정보를 Order 에 저장 - Order
      order.setPayment(paymentResult.payment);
      await this.orderOutputPort.updateOrder(order);

      return order;
    } catch {
      // 9. 실패 시 결제 취소 - Order
      order.cancelOrder();
      await this.orderOutputPort.updateOrder(order);
      return order;
    }
  }
}
