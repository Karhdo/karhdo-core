import { ConsumeMessage, Options } from 'amqplib';

export enum RejectMessageStrategy {
  FRONT = 'front',
  REAR = 'rear',
}

export type AllowArray<T> = T | T[];

export type ConsumedMessage = Record<string, any>;

export type PublishedMessage = ConsumedMessage;

export type ConsumeHandler<T = ConsumedMessage> = (
  message: AllowArray<T>,
  rawMessage: AllowArray<ConsumeMessage>,
) => Promise<unknown>;

export interface QueueOptions extends Options.AssertQueue {
  channel?: string;
}

export interface ConsumerOptions {
  queue?: string;
  createQueueIfNotExists?: boolean;
  queueOptions?: QueueOptions;

  exchange?: string;
  routingKey?: string;

  routingKeys?: string[];

  rejectMessageStrategy?: RejectMessageStrategy;

  enable?: boolean;

  batchSize?: number;
  idleTimeout?: number;
}
