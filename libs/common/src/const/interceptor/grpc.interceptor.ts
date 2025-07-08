import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

export class GrpcInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const data = context.switchToRpc().getData();
    const ctx = context.switchToRpc().getContext();
    const meta = ctx.getMap(); //grpc에서 넣어준 메타데이터를 맵형태로 가져옴

    // 요청을 받은 클래스를 의미
    const targetClass = context.getClass().name; // 인터셉터가 실행된 클래스의 이름을 가져옴
    const targetHandler = context.getHandler().name;

    const traceId = meta['trace-id'];
    const clientService = meta['client-service'];
    const clientClass = meta['client-class'];
    const clientMethod = meta['client-method'];

    const from = `${clientService}/${clientClass}/${clientMethod}`;
    const to = `${targetClass}/${targetHandler}`;

    const requestTimestamp = new Date();

    const receivedRequestLog = {
      type: 'RECEIVED_REQUEST',
      traceId,
      from,
      to,
      data,
      timestamp: requestTimestamp.toUTCString(),
    };

    return next.handle().pipe(
      map((data) => {
        const responseTimestamp = new Date();
        const responseTime = `${+responseTimestamp - +requestTimestamp}ms`;

        const responseLog = {
          type: 'RETURN_RESPONSE',
          traceId,
          from,
          to,
          data,
          responseTime,
          timestamp: responseTimestamp.toUTCString(),
        };

        return data;
      }),
    );
  }
}
