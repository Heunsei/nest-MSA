import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from './entity/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createSample() {
    const data = [
      {
        name: '사과',
        price: 2000,
        description: '맛있는 사과',
        stock: 2,
      },
      {
        name: '수박',
        price: 3000,
        description: '시원한 수박',
        stock: 4,
      },
      {
        name: '참외',
        price: 6000,
        description: '달달한 참외',
        stock: 3,
      },
      {
        name: '상추',
        price: 1000,
        description: '상추상추',
        stock: 0,
      },
      {
        name: '바나나',
        price: 1500,
        description: '바나나나',
        stock: 6,
      },
    ];
    await this.productRepository.save(data);
    return true;
  }

  async getProductsInfo(productIds: string[]) {
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
    });

    return products;
  }
}
