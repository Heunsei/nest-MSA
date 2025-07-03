import { Controller } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductMicroService } from '@app/common';

@Controller('product')
@ProductMicroService.ProductServiceControllerMethods()
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
