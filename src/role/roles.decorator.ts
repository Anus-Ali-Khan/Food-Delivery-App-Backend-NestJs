import { Reflector } from '@nestjs/core';
import { Role } from 'src/users/dto/createUser.dto';

export const Roles = Reflector.createDecorator<Role[]>();
