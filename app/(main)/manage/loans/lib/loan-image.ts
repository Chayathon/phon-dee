import "server-only";
import { deleteFile, uploadFile } from "@/lib/upload-file";

export const uploadLoanImage = (file: File) =>
    uploadFile(file, {
        prefix: "loans/",
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
