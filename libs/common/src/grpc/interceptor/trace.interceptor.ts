import { InterceptingCall } from '@grpc/grpc-js';

// 어떤 마이크로 서비스에서 실행되었는지 서비스를 넣어줄 것.
export const traceInterceptor = (service: string) => (options, nextCall) => {
  return new InterceptingCall(nextCall(options), {
    start: function (metadata, listener, next) {
      metadata.set('client-service', service);

      next(metadata, listener);
    },
  });
};
