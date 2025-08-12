import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";

export function UploadFileS3(fieldName : string, max : number = 1){
    if (max === 1) {
        return FileInterceptor(fieldName, {
            storage : memoryStorage(),
        });
    }
    return FilesInterceptor(fieldName, max, {
        storage : memoryStorage(),
    });
}

export function UploadMultipleFilesS3(fieldNames: string[]) {
    return class UploadMultipleUtility extends FilesInterceptor(fieldNames[0], fieldNames.length, {
        storage: memoryStorage(),
    }) {
        constructor() {
            super(fieldNames[0], fieldNames.length, {
                storage: memoryStorage(),
            });
        }
    };
}