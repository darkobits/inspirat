import AWS from 'aws-sdk';

const s3Client = new AWS.S3();

export interface GetJSONOptions {
  bucket: string;
  key: string;
}

export async function getJSON<T = any>({ bucket, key }: GetJSONOptions): Promise<T | undefined> {
  const response = await s3Client.getObject({
    Bucket: bucket,
    Key: key,
    ResponseContentType: 'application/json'
  }).promise();

  if (!response.Body) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return JSON.parse(response.Body.toString('utf8'));
}

export interface PutJSONOptions {
  bucket: string;
  key: string;
  body: any;
}

export async function putJSON({ bucket, key, body }: PutJSONOptions) {
  await s3Client.putObject({
    ACL: 'public-read',
    Bucket: bucket,
    Key: key,
    ContentType: 'application/json',
    Body: JSON.stringify(body)
  }).promise();
}
