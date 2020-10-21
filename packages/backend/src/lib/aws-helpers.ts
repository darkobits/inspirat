import { SQS } from 'aws-sdk';

export interface AmazonResourceName {
  partition: string;
  service: string;
  region: string;
  accountId: string;
  resource: string;
  resourceType?: string;
  qualifier: string;
}


/**
 * Provided an AWS Amazon Resource Name, returns an object describing the
 * resource.
 */
export function parseArn(arn: string): AmazonResourceName {
  if (typeof arn !== 'string' || !arn.startsWith('arn:')) {
    throw new Error('Invalid ARN.');
  }

  const [, partition, service, region, accountId, resourceOrResourceType, resource, qualifier] = arn.split(/[/:]/);

  if (!partition) {
    throw new Error('Invalid ARN; no partition.');
  }

  if (!service) {
    throw new Error('Invalid ARN; no service.');
  }

  if (!region) {
    throw new Error('Invalid ARN; no region.');
  }

  if (!accountId) {
    throw new Error('Invalid ARN; no account ID.');
  }

  const results: Partial<AmazonResourceName> = {
    partition,
    service,
    region,
    accountId
  };

  if (!resource) {
    results.resource = resourceOrResourceType;
  } else {
    results.resourceType = resourceOrResourceType;
    results.resource = resource;
  }

  if (qualifier) {
    results.qualifier = qualifier;
  }

  return results as AmazonResourceName;
}


/**
 * Provided a queue name, returns an SQS instance "bound" to the queue.
 */
export async function getQueueHandle(queueName: string, params?: any): Promise<SQS> {
  const sqs = new SQS();

  const {QueueUrl} = await sqs.getQueueUrl({
    QueueName: queueName
  }).promise();

  return new SQS({
    params: {
      QueueUrl,
      ...params
    }
  });
}
