import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to allow pending users to access specific endpoints
 * Typically used for GET endpoints where pending users should be able to view data
 */
export const AllowPending = () => SetMetadata('allowPending', true);
