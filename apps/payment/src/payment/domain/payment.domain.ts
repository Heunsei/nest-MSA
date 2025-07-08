// payment.entity.ts 를 기준으로 설계

// 어떤 프로퍼티 들이 필요한가?
// 도메인 -> 비즈니스 로직을 가장 간단하고 외부 디펜던시에 의존하지 않도록 코드를 작성
export enum PaymentStatus {
  pending = 'Pending',
  rejected = 'Rejected',
  approved = 'Approved',
}

export enum PaymentMethod {
  creditCard = 'CreditCard',
  kakao = 'Kakao',
}

export enum NotificationStatus {
  pending = 'pending',
  sent = 'sent',
}

export class PaymentDomain {
  id: string;
  orderId: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  cardNumber: string;
  expiryYear: string;
  expiryMonth: string;
  birthOrRegistration: string;
  passwordTwoDigits: string;
  notificationStatus: NotificationStatus;
  amount: number;
  userEmail: string;

  constructor(param: {
    paymentMethod: PaymentMethod;
    cardNumber: string;
    expiryYear: string;
    expiryMonth: string;
    birthOrRegistration: string;
    passwordTwoDigits: string;
    amount: number;
    userEmail: string;
    orderId: string;
  }) {
    this.paymentMethod = param.paymentMethod;
    this.cardNumber = param.cardNumber;
    this.expiryYear = param.expiryYear;
    this.expiryMonth = param.expiryMonth;
    this.birthOrRegistration = param.birthOrRegistration;
    this.passwordTwoDigits = param.passwordTwoDigits;
    this.userEmail = param.userEmail;
    this.orderId = param.orderId;
    this.amount = param.amount;
    this.paymentStatus = PaymentStatus.pending;
    this.notificationStatus = NotificationStatus.pending;
  }
  // 어떤 정보들을 저장하고 있을것이고 어떤 행위를 할 지 누구나 알 수 있도록 코드를 작성
  assignId(id: string) {
    this.id = id;
  }

  processPayment() {
    if (!this.id) {
      throw new Error('ID가 없는 주문을 결제할 수 없습니다.');
    }
    this.paymentStatus = PaymentStatus.approved;
  }

  rejectPayment() {
    if (this.id) {
      throw new Error('ID가 없는 주문을 결제 거절 할 수 없습니다');
    }

    this.paymentStatus = PaymentStatus.rejected;
  }

  sendNotification() {
    this.notificationStatus = NotificationStatus.sent;
  }
}
