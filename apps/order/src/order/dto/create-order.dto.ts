import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from './address.dto';
import { PaymentDto } from './payment.dto';
import { UserMeta, UserPayloadDto } from '@app/common';

// UserMeta를 추가한다면
export class CreateOrderDto implements UserMeta {
  // 규격화 된 이 프로퍼티를 추가하도록 할 수 있음.
  @ValidateNested()
  @IsNotEmpty()
  meta: {
    user: UserPayloadDto;
  };

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  productIds: string[];

  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  address: AddressDto;

  @ValidateNested()
  @Type(() => PaymentDto)
  @IsNotEmpty()
  payment: PaymentDto;
}
