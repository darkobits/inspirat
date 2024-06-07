import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client();

export interface GetJSONOptions {
  bucket: string;
  key: string;
}

export async function getJSON<T = any>({ bucket, key }: GetJSONOptions): Promise<T | undefined> {
  const response = await s3Client.send(new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentType: 'application/json'
  }));

  if (!response.Body) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return JSON.parse(await response.Body.transformToString());
}

export interface PutJSONOptions {
  bucket: string;
  key: string;
  body: any;
}

export async function putJSON({ bucket, key, body }: PutJSONOptions) {
  await s3Client.send(new PutObjectCommand({
    ACL: 'public-read',
    Bucket: bucket,
    Key: key,
    ContentType: 'application/json',
    Body: JSON.stringify(body)
  }));
}
