import { SetMetadata } from '@nestjs/common';

export const ROLE_KEY = 'role'
export const PERMISSION_KEY = 'permission'
export const Access = (role: Number[] = [], permission: Number[] = []) => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    SetMetadata(ROLE_KEY, role)(target, key, descriptor);
    SetMetadata(PERMISSION_KEY, permission)(target, key, descriptor);
    return descriptor;
  };
}
