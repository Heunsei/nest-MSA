import { Inject, OnModuleInit } from '@nestjs/common';
import { ProductOutputPort } from '../../port/output/product.output-port';
import { ProductEntity } from '../../domain/product.entity';
import { PRODUCT_SERVICE, ProductMicroService } from '@app/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { GetProductsIdsResponseMapper } from './mapper/get-products-info-response.mapper';

export class ProductGrpc implements ProductOutputPort, OnModuleInit {
  productClient: ProductMicroService.ProductServiceClient;

  constructor(
    @Inject(PRODUCT_SERVICE)
    private readonly productMicroservier: ClientGrpc,
  ) {}

  onModuleInit() {
    this.productClient =
      this.productMicroservier.getService<ProductMicroService.ProductServiceClient>(
        'ProductService',
      );
  }

  async getProductsByIds(productIds: string[]): Promise<ProductEntity[]> {
    const resp = await lastValueFrom(
      this.productClient.getProductsInfo({
        productIds,
      }),
    );

    return new GetProductsIdsResponseMapper(resp).toDomain();
  }
}
