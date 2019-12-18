import * as Amqp from 'amqp-ts';
import {
  CompletedMissionPayload,
  CompletedQuestPayload,
  CompletedTaskPayload,
  IMessengerProtocol
} from '../interfaces/IMessageProtocol';
import {QuestSystemConfig} from '../QuestSystem';

const QUESTIO_EXCHANGE_NAME = 'QUESTIO_EXCHANGE';
const QUESTIO_QUEUE_NAME = 'QUESTIO_QUEUE';

export type simpleRabbitMQMessengerOptions = {
  connectionURI: string;
  queueName?: string;
  exchangeName?: string;

}

export function simpleRabbitMQMessenger(options: simpleRabbitMQMessengerOptions): IMessengerProtocol {
  return new class RabbitMQMessenger implements IMessengerProtocol {

    private connection?: Amqp.Connection;
    private queue?: Amqp.Queue;
    private exchange?: Amqp.Exchange;

    init(config: QuestSystemConfig): void {
      this.connection = new Amqp.Connection(options.connectionURI);
      this.exchange = this.connection.declareExchange(options.exchangeName || QUESTIO_EXCHANGE_NAME, 'fanout');
      this.queue = this.connection.declareQueue(options.queueName || QUESTIO_QUEUE_NAME);
      this.queue.bind(this.exchange);
      console.log(`[*] Publisher ${this.queue.name} initialized with exchange ${this.exchange.name} to the queue ${this.queue.name}`);
    }

    sendCompletedTask(payload: CompletedTaskPayload): void {
      if (this.exchange) {
        const msg = new Amqp.Message(payload);
        this.exchange.send(msg);
      }
    }

    sendCompletedQuest(payload: CompletedQuestPayload): void {
      if (this.exchange) {
        const msg = new Amqp.Message(payload);
        this.exchange.send(msg);
      }
    }

    sendCompletedMission(payload: CompletedMissionPayload): void {
      if (this.exchange) {
        const msg = new Amqp.Message(payload);
        this.exchange.send(msg);
      }
    }
  }
}
