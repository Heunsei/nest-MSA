import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  PAYMENT_SERVICE,
  PaymentMicroService,
  PRODUCT_SERVICE,
  ProductMicroService,
  USER_SERVICE,
  UserMicroService,
} from '@app/common';
import { PaymentCancelledException } from './exception/payment-cancelled.exception';
import { Product } from './entity/product.entity';
import { Customer } from './entity/customer.entity';
import { AddressDto } from './dto/address.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderStatus } from './entity/order.entity';
import { Model } from 'mongoose';
import { PaymentDto } from './dto/payment.dto';
import { PaymentFailedException } from './exception/payment-failed.exception';

@Injectable()
export class OrderService implements OnModuleInit {
  userService: UserMicroService.UserServiceClient;
  productService: ProductMicroService.ProductServiceClient;
  paymentService: PaymentMicroService.PaymentServiceClient;

  constructor(
    // @Inject(USER_SERVICE)
    // private readonly userService: ClientProxy,
    // @Inject(PRODUCT_SERVICE)
    // private readonly productService: ClientProxy,
    // @Inject(PAYMENT_SERVICE)
    // private readonly paymentService: ClientProxy,
    @Inject(USER_SERVICE)
    private readonly userMicroservice: ClientGrpc,
    @Inject(PRODUCT_SERVICE)
    private readonly productMicroservice: ClientGrpc,
    @Inject(PAYMENT_SERVICE)
    private readonly paymentMicroservice: ClientGrpc,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
  ) {}
  onModuleInit() {
    this.userService =
      this.userMicroservice.getService<UserMicroService.UserServiceClient>(
        'UserService',
      );
    this.productService =
      this.productMicroservice.getService<ProductMicroService.ProductServiceClient>(
        'ProductService',
      );
    this.paymentService =
      this.paymentMicroservice.getService<PaymentMicroService.PaymentServiceClient>(
        'PaymentService',
      );
  }

  async createOrder(createOrderDto: CreateOrderDto) {
    const { productIds, address, payment, meta } = createOrderDto;

    // 사용자 정보 가져오기
    const user = await this.getUserFromToken(meta.user.sub);

    // 상품 정보 가져오기
    const products = await this.getProductsByIds(productIds);

    // 총 금액 계산하기
    const totalAmount = this.calculateTotalAmount(products);

    // 금액 검증
    this.validatePaymentAmount(totalAmount, payment.amount);

    // 주문 생성
    const customer = this.createCustomer(user);
    const order = await this.createNewOrder(
      customer,
      products,
      address,
      payment,
    );

    // 결제 시도
    const processedPayment = await this.processPayment(
      order._id.toString(),
      payment,
      user.email,
    );

    // 결과 반환
    return this.orderModel.findById(order._id);
  }

  // gateway에서 전부 처리를 하고 ( 가드 및 미들웨어 ) 데이터를 전달해주기 때문에 더이상
  // User를 검증하는 과정이 필요가 없어짐
  private async getUserFromToken(userId: string) {
    // // USER - MS : jwtToken 검증
    // const tResp = await lastValueFrom(
    //   this.userService.send({ cmd: 'parse_bearer_token' }, { token }),
    // );

    // if (tResp.status === 'error') {
    //   throw new PaymentCancelledException(tResp);
    // }

    // console.log(tResp);

    // // USER - MS : user 가져오기
    // const userId = tResp.data.sub;

    const uResp = await lastValueFrom(this.userService.getUserInfo({ userId }));

    return uResp;
  }

  private async getProductsByIds(productIds: string[]): Promise<Product[]> {
    const resp = await lastValueFrom(
      this.productService.getProductsInfo({
        productIds,
      }),
    );

    return resp.products.map((product) => ({
      productId: product.id,
      name: product.name,
      price: product.price,
    }));
  }

  private calculateTotalAmount(product: Product[]) {
    return product.reduce((acc, next) => acc + next.price, 0);
  }

  validatePaymentAmount(totalA: number, totalB: number) {
    if (totalA !== totalB) {
      throw new PaymentCancelledException('결제하려는 금액이 변경되었습니다');
    }
  }

  private createCustomer(user: { id: string; email: string; name: string }) {
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
  }

  private createNewOrder(
    customer: Customer,
    products: Product[],
    deliveryAddress: AddressDto,
    payment: PaymentDto,
  ) {
    return this.orderModel.create({
      customer,
      products,
      deliveryAddress,
      payment,
    });
  }

  async processPayment(
    orderId: string,
    payment: PaymentDto,
    userEmail: string,
  ) {
    try {
      const resp = await lastValueFrom(
        this.paymentService.makePayment({
          ...payment,
          userEmail,
          orderId,
        }),
      );

      const isPaid = resp.paymentStatus === 'Approved';
      const orderStatus = isPaid
        ? OrderStatus.paymentProcessed
        : OrderStatus.paymentFailed;

      if (orderStatus === OrderStatus.paymentFailed) {
        throw new PaymentFailedException(resp);
      }

      await this.orderModel.findByIdAndUpdate(orderId, {
        status: OrderStatus.paymentProcessed,
      });

      return resp;
    } catch (e) {
      if (e instanceof PaymentFailedException) {
        await this.orderModel.findByIdAndUpdate(orderId, {
          status: OrderStatus.paymentFailed,
        });
      }
      throw e;
    }
  }

  async changeOrderStatus(orderId: string, status: OrderStatus) {
    return this.orderModel.findByIdAndUpdate(orderId, { status });
  }
}
