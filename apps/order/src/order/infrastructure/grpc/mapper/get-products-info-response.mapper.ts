import { ProductMicroService } from '@app/common';
import { ProductEntity } from 'apps/order/src/order/domain/product.entity';

export class GetProductsIdsResponseMapper {
  constructor(
    private readonly response: ProductMicroService.GetProductsInfoResponse,
  ) {}

  toDomain(): ProductEntity[] {
    return this.response.products.map(
      (product) =>
        new ProductEntity({
          productId: product.id,
          name: product.name,
          price: product.price,
        }),
    );
  }
}
