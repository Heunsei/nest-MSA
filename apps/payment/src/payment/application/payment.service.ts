// adapter ( paymentInput adapter ) 에서 실행하는 부분을

import { Inject, Injectable } from '@nestjs/common';
import { PaymentDomain, PaymentMethod } from '../domain/payment.domain';
import { DatabaseOutputPort } from '../port/output/database.output-port';
import { NetworkOutputPort } from '../port/output/network.output-port';
import { PaymentOutputPort } from '../port/output/payment.output-port';

// 비즈니스 로직 관점에서 풀어냄
// application 은 도메인 밖에 존재
// 도메인을 application을 감싸고 있는데 유일하게 의존하는것이 Domain
// PORT들은 비즈니스 로직 레이어 안에 있기때문에 바깥에 있는것이 아님.
@Injectable()
export class PaymentService {
  constructor(
    @Inject('DatabaseOutputPort')
    private readonly databaseOutputPort: DatabaseOutputPort,
    @Inject('PaymentOutputPort')
    private readonly paymentOutputPort: PaymentOutputPort,
    @Inject('NetworkOutputPort')
    private readonly networkOutputPort: NetworkOutputPort,
  ) {}

  async makePayment(param: {
    orderId: string;
    userEmail: string;
    paymentMethod: PaymentMethod;
    cardNumber: string;
    expiryYear: string;
    expiryMonth: string;
    birthOrRegistration: string;
    passwordTwoDigits: string;
    amount: number;
  }) {
    // 1. PaymentModel 생성 -> Domain 객체 생성
    const payment = new PaymentDomain(param);
    // 2. PaymentModel 저장 ( DB )
    // 여기서는 구현체를 어떤 기능들을 포트에 정의해서 사용할 것.
    // @ts-ignore
    const result = await this.databaseOutputPort.savePayment(payment);

    // 3. 저장된 데이터의 ID를 PaymentDomain에 적용 -> Domain 에서 실행
    payment.assignId(result.id);

    // 4. 결제 실행 -> HTTP
    try {
      // @ts-ignore
      await this.paymentOutputPort.processPayment(payment);
      // 5. 결제 데이터 업데이트 -> DB
      payment.processPayment();
      await this.databaseOutputPort.updatePayment(payment);
    } catch {
      // 7. 실패 시 결제 reject -> DB, Domain
      payment.rejectPayment();
      await this.databaseOutputPort.updatePayment(payment);
      return payment;
    }
    // 6. 결제 성공 시 알림 -> gRPC
    this.networkOutputPort.sendNotification(param.orderId, param.userEmail);

    return payment;
  }
}
