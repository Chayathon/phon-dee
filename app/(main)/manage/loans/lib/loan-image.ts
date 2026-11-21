import "server-only";
import { deleteFile, getFile, uploadFile } from "@/lib/file";

const LOAN_IMAGE_PREFIX = "loans/";

export function getLoanImage(name: string) {
    return getFile(`${LOAN_IMAGE_PREFIX}${name}`);
}

export const uploadLoanImage = (file: File) =>
    uploadFile(file, {
        prefix: LOAN_IMAGE_PREFIX,
        extensions: {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
        },
        maxBytes: 4 * 1024 * 1024,
        invalidTypeMessage: "Image must be JPEG, PNG or WebP",
        tooLargeMessage: "Image must be 4 MB or smaller",
    });

export const deleteLoanImage = deleteFile;
