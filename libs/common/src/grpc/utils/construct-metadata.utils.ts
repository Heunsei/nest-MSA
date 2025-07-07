import { Metadata } from '@grpc/grpc-js';
import { v4 } from 'uuid';

export const constructMetadata = (
  callerClass: string,
  callerMethod: string,
  prevMetadata?: Metadata,
) => {
  const metadata = prevMetadata ?? new Metadata();

  const traceId = metadata.getMap()['trace-id'] ?? v4(); // 메타데이터의 값들을 map으로 받아올 수 있음

  metadata.set('trace-id', traceId);
  metadata.set('client-class', callerClass);
  metadata.set('client-method', callerMethod);

  return metadata;
};
