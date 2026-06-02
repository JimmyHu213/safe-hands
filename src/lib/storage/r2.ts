import { AwsClient } from "aws4fetch";

const MAX_EXPIRES = 7 * 86400;

function r2Endpoint(accountId: string): string {
  return `https://${accountId}.r2.cloudflarestorage.com`;
}

function client(input: { accessKeyId: string; secretAccessKey: string }) {
  return new AwsClient({
    accessKeyId: input.accessKeyId,
    secretAccessKey: input.secretAccessKey,
    service: "s3",
    region: "auto",
  });
}

export interface PresignPutInput {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  key: string;
  contentType: string;
  expiresInSeconds: number;
}

export async function presignPutUrl(input: PresignPutInput): Promise<string> {
  if (input.expiresInSeconds > MAX_EXPIRES) {
    throw new Error("expiresInSeconds exceeds R2 maximum of 7 days");
  }
  const url = `${r2Endpoint(input.accountId)}/${input.bucket}/${input.key}?X-Amz-Expires=${input.expiresInSeconds}`;
  const req = await client(input).sign(
    new Request(url, {
      method: "PUT",
      headers: { "Content-Type": input.contentType },
    }),
    { aws: { signQuery: true } },
  );
  return req.url;
}

export interface PresignGetInput {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  key: string;
  expiresInSeconds: number;
}

export async function presignGetUrl(input: PresignGetInput): Promise<string> {
  if (input.expiresInSeconds > MAX_EXPIRES) {
    throw new Error("expiresInSeconds exceeds R2 maximum of 7 days");
  }
  const url = `${r2Endpoint(input.accountId)}/${input.bucket}/${input.key}?X-Amz-Expires=${input.expiresInSeconds}`;
  const req = await client(input).sign(new Request(url, { method: "GET" }), {
    aws: { signQuery: true },
  });
  return req.url;
}
