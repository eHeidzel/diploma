import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@libs/shared';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
