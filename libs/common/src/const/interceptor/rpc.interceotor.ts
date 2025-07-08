import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { catchError, map, Observable, throwError } from 'rxjs';

export class RpcInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        const resp = {
          status: 'success',
          data,
        };
        return resp;
      }),
      catchError((err) => {
        const resp = {
          status: 'error',
          error: err,
        };
        return throwError(() => new RpcException(err));
      }),
    );
  }
}
