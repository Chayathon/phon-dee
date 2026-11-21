import "server-only";
import {
    DeleteObjectCommand,
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

const publicBase = () => `${process.env.AWS_ENDPOINT_URL_S3}/${BUCKET}/`;

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
    return `${publicBase()}${key}`;
}

export async function deleteFile(url: string): Promise<void> {
    if (!url.startsWith(publicBase())) return;
    await s3.send(
        new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: url.slice(publicBase().length),
        }),
    );
}
