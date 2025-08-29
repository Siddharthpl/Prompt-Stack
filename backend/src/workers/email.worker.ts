import { emailQueue } from '../services/rabbitmq';
import { processEmailJob } from '../services/emailService';
import { EmailJob } from '../services/emailService';

class EmailWorker {
  async start() {
    try {
      // Initialize the queue connection
      await emailQueue.initialize();
      
      console.log('Starting email worker...');
      
      // Start consuming messages from the queue
      await emailQueue.consume(async (message: EmailJob) => {
        console.log('Processing email job:', message.metadata);
        await processEmailJob(message);
      });
      
    } catch (error) {
      console.error('Error in email worker:', error);
      // Attempt to restart the worker after a delay
      setTimeout(() => this.start(), 5000);
    }
  }
}

// Start the worker if this file is run directly
if (require.main === module) {
  const worker = new EmailWorker();
  worker.start().catch(console.error);
}

export default EmailWorker;
