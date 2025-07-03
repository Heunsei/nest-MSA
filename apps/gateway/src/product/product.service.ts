import { PRODUCT_SERVICE, ProductMicroService } from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ProductService implements OnModuleInit {
  productService: ProductMicroService.ProductServiceClient;

  constructor(
    @Inject(PRODUCT_SERVICE)
    private readonly productMicroservice: ClientGrpc,
  ) {}

  onModuleInit() {
    this.productService =
      this.productMicroservice.getService<ProductMicroService.ProductServiceClient>(
        'ProductService',
      );
  }

  createSamples() {
    return lastValueFrom(this.productService.createSamples({}));
  }
}
