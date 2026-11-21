import "server-only";
import {
    DeleteObjectCommand,
    GetObjectCommand,
    NoSuchKey,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";

const BUCKET = "assets";

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
});

const urlBase = () => `${process.env.AWS_ENDPOINT_URL_S3}/${BUCKET}/`;

export function toFileUrl(url: string): string {
    return url.startsWith(urlBase())
        ? `/api/files/${url.slice(urlBase().length)}`
        : url;
}

export async function getFile(key: string) {
    try {
        const res = await s3.send(
            new GetObjectCommand({ Bucket: BUCKET, Key: key }),
        );

        return res.Body
            ? { body: res.Body, contentType: res.ContentType }
            : null;
    } catch (e) {
        if (e instanceof NoSuchKey) return null;
        throw e;
    }
}

export type UploadOptions = {
    prefix: string;
    extensions: Record<string, string>;
    maxBytes: number;
    invalidTypeMessage: string;
    tooLargeMessage: string;
};

export async function uploadFile(
    file: File,
    options: UploadOptions,
): Promise<string> {
    const ext = options.extensions[file.type];

    if (!ext) throw new Error(options.invalidTypeMessage);
    if (file.size > options.maxBytes) throw new Error(options.tooLargeMessage);

    const key = `${options.prefix}${crypto.randomUUID()}.${ext}`;
    await s3.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: new Uint8Array(await file.arrayBuffer()),
            ContentType: file.type,
        }),
    );
    return `${urlBase()}${key}`;
}

export async function deleteFile(url: string): Promise<void> {
    if (!url.startsWith(urlBase())) return;

    await s3.send(
        new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: url.slice(urlBase().length),
        }),
    );
}
