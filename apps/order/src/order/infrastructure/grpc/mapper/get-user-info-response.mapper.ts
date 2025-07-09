import { UserMicroService } from '@app/common';
import { CustomerEntity } from 'apps/order/src/order/domain/customer.entity';

export class GetUserInfoResponseMapper {
  constructor(
    private readonly response: UserMicroService.GetUserInfoResponse,
  ) {}

  toDomain() {
    return new CustomerEntity({
      userId: this.response.id,
      email: this.response.email,
      name: this.response.name,
    });
  }
}
