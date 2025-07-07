import { Controller, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductMicroService } from '@app/common';
import { GrpcInterceptor } from '@app/common/const/interceptor/grpc.interceptor';

@Controller('product')
@ProductMicroService.ProductServiceControllerMethods()
@UseInterceptors(GrpcInterceptor)
export class ProductController
  implements ProductMicroService.ProductServiceController
{
  constructor(private readonly productService: ProductService) {}

  async createSamples() {
    const resp = await this.productService.createSamples();

    return {
      success: resp,
    };
  }

  async getProductsInfo(request: ProductMicroService.GetProductsInfoRequest) {
    const resp = await this.productService.getProductsInfo(request.productIds);

    return {
      products: resp,
    };
  }
}
