import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PaymentMicroService } from '@app/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // 서버 입장에서 구현한 마이크로서비스, 엔드포인트를 받을 설정을 하는 과정임.
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: PaymentMicroService.protobufPackage,
      protoPath: join(process.cwd(), '/proto/payment.proto'),
      url: configService.getOrThrow('GRPC_URL'),
    },
  });

  await app.init();

  await app.startAllMicroservices();
}
bootstrap();
