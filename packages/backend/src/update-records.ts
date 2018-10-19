// @ts-ignore
import DynamoDBFactory from '@awspilot/dynamodb';
import env from '@darkobits/env';
import {SQS} from 'aws-sdk';
import axios from 'axios';

import {getQueueHandle} from 'lib/aws-helpers';
import {AWSLambdaFunction} from 'lib/aws-lambda';
import chalk from 'lib/chalk';
import {containsErrors} from 'lib/utils';


/**
 * Returns the approximate number of messages in the provided queue.
 */
async function getNumberOfMessagesInQueue(queueHandle: SQS): Promise<number> {
  // @ts-ignore
  const {Attributes} = await queueHandle.getQueueAttributes({AttributeNames: ['ApproximateNumberOfMessages']}).promise();

  if (!Attributes) {
    throw new Error('Unable to retrieve queue attributes.');
  }

  return parseInt(Attributes.ApproximateNumberOfMessages, 10);
}


/**
 * Processes a batch of messages from the provided queue.
 */
async function processBatch(queueHandle: SQS, tableHandle: any) {
  // @ts-ignore
  const {Messages} = await queueHandle.receiveMessage({MaxNumberOfMessages: 10}).promise();

  if (!Messages || !Messages.length) {
    return;
  }

  const results = await Promise.all(Messages.map(async (message: SQS.Types.Message) => {
    if (!message.Body) {
      return new Error('Message has no body.');
    }

    const body = JSON.parse(message.Body);


    // ----- Request Photo From Unsplash ---------------------------------------

    let photoRes: any;

    try {
      photoRes = await axios({
        method: 'GET',
        url: `https://api.unsplash.com/photos/${body.id}`,
        headers: {
          'Accept-Version': 'v1',
          'Authorization': `Client-ID ${env('UNSPLASH_ACCESS_KEY', true)}`
        }
      });

      console.log(`[update-records] Received data for photo ${chalk.green(body.id)} from Unsplash.`);
    } catch (err) {
      return err;
    }


    // ----- Add Photo to Database ---------------------------------------------

    const photo = photoRes.data;

    try {
      await tableHandle.insert(photo);
      console.log(`[update-records] Record ${chalk.green(body.id)} updated in database.`);
    } catch (err) {
      if (err.message.includes('The conditional request failed')) {
        console.warn(`[update-records] ${chalk.red('WARNING')}: Unable to write record to database: ${err.message}`);
      } else {
        throw err;
      }
    }


    // ----- Delete Message from Queue -----------------------------------------

    // @ts-ignore
    await queueHandle.deleteMessage({ReceiptHandle: message.ReceiptHandle}).promise();

    console.log(`[update-records] Message ${chalk.green(body.id)} deleted from queue.`);

    return true;
  }));

  if (containsErrors(results)) {
    throw new Error('Unable to process all messages.');
  }
}


// ----- Update Records --------------------------------------------------------

/**
 * This function pulls a batch of messages from the queue, then queries the
 * Unsplash Photo API, adding the result to the DynamoDB table.
 *
 * If the queue has no messages, or if the Unsplash rate limit is reached, the
 * function will exit early.
 *
 * Otherwise, it will continue running until all messages in the queue have been
 * processed.
 */
export default AWSLambdaFunction({
  async handler(res) {
    // ----- [1] Create Resource Handles ---------------------------------------

    const tableHandle = new DynamoDBFactory().table(`inspirat-${env('STAGE', true)}`);
    const queueHandle = await getQueueHandle(`inspirat-${env('STAGE', true)}`);


    // ----- [2] Process Messages From Queue -----------------------------------

    let numMessages = await getNumberOfMessagesInQueue(queueHandle);
    console.log(`[update-records] Initial number of messages: ${chalk.green(numMessages.toString())}.`);

    while (numMessages) {
      await processBatch(queueHandle, tableHandle);
      console.log('[update-records] Batch processed successfully.');

      numMessages = await getNumberOfMessagesInQueue(queueHandle);
      console.log(`[update-records] Messages remaining: ${chalk.green(numMessages.toString())}.`);
    }

    res.body = {
      message: 'OK'
    };
  }
});
