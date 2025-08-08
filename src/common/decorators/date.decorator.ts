import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import * as moment from "moment-jalaali";
export function IsJalaliDateTime(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isJalaliDateTime',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          const regex = /^(\d{4})\/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])(?:\s([01]\d|2[0-3]):([0-5]\d))?$/;
          const match = value.match(regex);
          if (!match) return false;

          const year = parseInt(match[1], 10);
          const month = parseInt(match[2], 10);
          const day = parseInt(match[3], 10);
          const hour = match[4] ? parseInt(match[4], 10) : null;
          const minute = match[5] ? parseInt(match[5], 10) : null;

          if (year < 1300 || year > moment().jYear()) return false;
          if (month < 1 || month > 12) return false;
          if (day < 1 || day > 31) return false;
          if (hour !== null && (hour < 0 || hour > 23)) return false;
          if (minute !== null && (minute < 0 || minute > 59)) return false;

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} باید تاریخ شمسی معتبر به فرمت 'yyyy/mm/dd' یا 'yyyy/mm/dd HH:mm' باشد.`;
        }
      }
    });
  };
}
