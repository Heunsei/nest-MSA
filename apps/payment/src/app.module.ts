import { Module } from '@nestjs/common';
import { PaymentModule } from './payment/payment.module';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  NOTIFICATION_SERVICE,
  NotificationMicroService,
  traceInterceptor,
} from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_URL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (ConfigService: ConfigService) => ({
        type: 'postgres',
        url: ConfigService.getOrThrow<string>('DB_URL'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGO_DB_URL'),
      }),
      inject: [ConfigService],
    }),
    // 내가 클라이언트로서 다른 서버에 연결할때의 정보를 넣어놓는것
    // 이렇게 생긴 마이크로 서비스가 있을건데 이것을 연결할것이라는 뜻.
    ClientsModule.registerAsync({
      clients: [
        {
          name: NOTIFICATION_SERVICE,
          useFactory: (configService: ConfigService) => ({
            transport: Transport.GRPC,
            options: {
              channelOptions: {
                interceptors: [traceInterceptor('Payment')],
              },
              package: NotificationMicroService.protobufPackage,
              protoPath: join(process.cwd(), 'proto/notification.proto'),
              url: configService.getOrThrow('NOTIFICATION_GRPC_URL'),
            },
          }),
          inject: [ConfigService],
        },
      ],
      isGlobal: true,
    }),
    PaymentModule,
  ],
})
export class AppModule {}
