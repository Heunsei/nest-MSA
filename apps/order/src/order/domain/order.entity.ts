import { CustomerEntity } from './customer.entity';
import { DeliveryAddressEntity } from './delivery-address.entity';
import { PaymentEntity } from './payment.entity';
import { ProductEntity } from './product.entity';

export enum OrderStatus {
  pending = 'Pending',
  paymentCancelled = 'PaymentCancelled',
  paymentFailed = 'PaymentFailed',
  paymentProcessed = 'PaymentProcessed',
  deliveryStarted = 'DeliveryStarted',
  deliveryDone = 'DeliveryDone',
}

export class OrderEntity {
  id: string;
  customer: CustomerEntity;
  products: ProductEntity[];
  deliveryAddress: DeliveryAddressEntity;
  status: OrderStatus;
  payment: PaymentEntity;
  totalAmount: number;

  constructor(param: {
    customer: CustomerEntity;
    products: ProductEntity[];
    deliveryAddress: DeliveryAddressEntity;
  }) {
    this.customer = param.customer;
    this.products = param.products;
    this.deliveryAddress = param.deliveryAddress;
  }

  setId(id: string) {
    this.id = id;
  }

  setPayment(payment: PaymentEntity) {
    if (!this.id) {
      throw new Error('id가 없는 주문에는 결제를 세팅 할 수 없습니다');
    }
    this.payment = payment;
  }

  calculateTotalAmount() {
    if (this.products.length === 0) {
      throw new Error('상품 리스트의 길이가 0입니다');
    }

    const total = this.products.reduce((acc, n) => (acc = n.price), 0);

    if (total < 0) {
      throw new Error('결제 금액의 총합이 0 보다 작습니다');
    }

    this.totalAmount = total;
  }

  processPayment() {
    if (!this.id) {
      throw new Error('결제를 진행하기 위해선 주문 ID가 필수입니다');
    }

    if (this.products.length === 0) {
      throw new Error('결제를 진행하기 위해선 상품이 한 개 이상 필요합니다');
    }

    if (!this.deliveryAddress) {
      throw new Error('결제를 진행하기 위해선 배송 주소가 필요합니다');
    }

    if (!this.totalAmount) {
      throw new Error('결제 총액이 저장되지 않았습니다');
    }

    if (this.status !== OrderStatus.pending) {
      throw new Error(
        'Orderstatus.pending 상태에서만 결제를 진행할 수 있습니다',
      );
    }

    this.status = OrderStatus.paymentProcessed;
  }

  cancelOrder() {
    this.status = OrderStatus.paymentCancelled;
  }

  startDelivery() {
    if (this.status !== OrderStatus.paymentProcessed) {
      throw new Error(
        'Orderstatus.paymentProcessed 상태에서만 배송이 시작 가능합니다',
      );
    }
    this.status = OrderStatus.deliveryStarted;
  }

  finishDelivery() {
    if (this.status !== OrderStatus.deliveryStarted) {
      throw new Error(
        'OrderStatus.deliveryStarted 상태에서만 완료가 가능합니다',
      );
    }

    this.status = OrderStatus.deliveryDone;
  }
}
