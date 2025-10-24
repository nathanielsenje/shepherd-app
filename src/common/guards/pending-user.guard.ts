import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard to prevent pending users from performing mutations
 * Pending users can only read/view data, not create/update/delete
 */
@Injectable()
export class PendingUserGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if the route allows pending users
    const allowPending = this.reflector.getAllAndOverride<boolean>('allowPending', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (allowPending) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has PENDING status and if the request is a mutation (POST, PUT, PATCH, DELETE)
    const method = request.method;
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    if (user.status === 'PENDING' && isMutation) {
      throw new ForbiddenException('Your account is pending approval. You can view data but cannot make changes.');
    }

    return true;
  }
}
