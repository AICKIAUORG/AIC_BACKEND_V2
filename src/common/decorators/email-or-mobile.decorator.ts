import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsEmailOrMobile(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEmailOrMobile',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailRegex.test(value)) {
            return true;
          }
          const mobileRegex = /^09[0-9]{9}$/;
          return mobileRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'لطفا یک ایمیل یا شماره موبایل معتبر وارد کنید';
        },
      },
    });
  };
}