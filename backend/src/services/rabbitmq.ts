import * as amqp from 'amqplib';

type MessageHandler = (message: any) => Promise<void>;

class RabbitMQService {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private readonly url: string;
  private readonly queueName: string;
  private isInitialized = false;

  constructor(queueName: string = 'email_queue') {
    this.url = process.env.RABBITMQ_URL || 'amqp://localhost';
    this.queueName = queueName;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();
      
      if (!this.channel) {
        throw new Error('Failed to create channel');
      }
      
      // Assert queue with dead letter exchange for failed messages
      await this.channel.assertQueue(this.queueName, {
        durable: true,
        deadLetterExchange: '',
        deadLetterRoutingKey: `${this.queueName}_failed`
      });
      
      await this.channel.assertQueue(`${this.queueName}_failed`, { durable: true });
      
      if (this.connection) {
        this.connection.on('error', (err) => {
          console.error('RabbitMQ connection error:', err);
          this.isInitialized = false;
        });
      }
      
      this.isInitialized = true;
      console.log('RabbitMQ connected and channel created');
    } catch (error) {
      console.error('Failed to initialize RabbitMQ:', error);
      throw error;
    }
  }

  async publish(message: any) {
    if (!this.isInitialized || !this.channel) {
      throw new Error('RabbitMQ not initialized');
    }
    
    await this.channel.sendToQueue(
      this.queueName,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
  }

  async consume(handler: MessageHandler) {
    if (!this.isInitialized || !this.channel) {
      throw new Error('RabbitMQ not initialized');
    }

    console.log(`Waiting for messages in ${this.queueName}`);
    
    this.channel.consume(this.queueName, async (msg) => {
      if (!msg) return;
      
      try {
        const content = JSON.parse(msg.content.toString());
        await handler(content);
        this.channel?.ack(msg);
      } catch (error) {
        console.error('Error processing message:', error);
        // Message will be rejected and moved to dead letter queue
        this.channel?.nack(msg, false, false);
      }
    });
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    this.isInitialized = false;
  }
}

export const emailQueue = new RabbitMQService('email_queue');
export default RabbitMQService;
