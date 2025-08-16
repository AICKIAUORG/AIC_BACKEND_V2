import { BadRequestException } from '@nestjs/common';
import { toMG } from './function.utils';

export interface FileRule {
  maxSize?: number; // MG
  allowedTypes?: string[];
  required?: boolean;
  multiple?: boolean; 
  maxCount?: number; 
}

export function validateFiles(files: any, rules: Record<string, FileRule>) {
  const validated: Record<string, any> = {};

  for (const [fieldName, rule] of Object.entries(rules)) {
    const fileArray = files[fieldName] || [];
    
    if (rule.required && fileArray.length === 0) {
      throw new BadRequestException(`${fieldName} فایل الزامی است`);
    }

    if (rule.multiple) {
      if (rule.maxCount && fileArray.length > rule.maxCount) {
        throw new BadRequestException(`${fieldName} حداکثر ${rule.maxCount} فایل مجاز است`);
      }

      const validFiles = [];
      for (const file of fileArray) {
        if (rule.maxSize && file.size > toMG(rule.maxSize)) {
          throw new BadRequestException(`${fieldName} فایل باید کمتر از ${rule.maxSize}MB باشد`);
        }

        if (rule.allowedTypes && !rule.allowedTypes.includes(file.mimetype)) {
          throw new BadRequestException(`${fieldName} فایل باید از نوع ${rule.allowedTypes.join(', ')} باشد`);
        }

        validFiles.push(file);
      }

      validated[fieldName] = validFiles;
    } else {
      const file = fileArray[0];
      if (file) {
        if (rule.maxSize && file.size > toMG(rule.maxSize)) {
          throw new BadRequestException(`${fieldName} فایل باید کمتر از ${rule.maxSize}MB باشد`);
        }

        if (rule.allowedTypes && !rule.allowedTypes.includes(file.mimetype)) {
          throw new BadRequestException(`${fieldName} فایل باید از نوع ${rule.allowedTypes.join(', ')} باشد`);
        }

        validated[fieldName] = file;
      }
    }
  }

  return validated;
}
