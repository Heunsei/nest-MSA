import { Module } from '@nestjs/common';
import { PaymentController } from './adapter/input/payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './application/payment.service';
import { PaymentEntity } from './adapter/output/typeorm/entity/payment.entity';
import { TypeOrmAdapter } from './adapter/output/typeorm/typeorm.adapter';
import { GrpcAdapter } from './adapter/output/grpc/grpc.adapter';
import { PortoneAdapter } from './adapter/output/portone/portone.adapter';
import { MongooseAdapter } from './adapter/output/mongoose/mongoose.adapter';
// import { MongooseModule } from '@nestjs/mongoose';
// import {
//   PaymentDocument,
//   PaymentSchema,
// } from './adapter/output/mongoose/document/payment.document';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntity]),
    // MongooseModule.forFeature([
    //   {
    //     name: PaymentDocument.name,
    //     schema: PaymentSchema,
    //   },
    // ]),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: 'DatabaseOutputPort',
      useClass: TypeOrmAdapter,
      // useClass: MongooseAdapter
    },
    {
      provide: 'NetworkOutputPort',
      useClass: GrpcAdapter,
    },
    {
      provide: 'PaymentOutputPort',
      useClass: PortoneAdapter,
    },
  ],
})
export class PaymentModule {}
