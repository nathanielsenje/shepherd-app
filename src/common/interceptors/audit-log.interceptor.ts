import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../config/database.config';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const auditableActions = ['POST', 'PUT', 'PATCH', 'DELETE'];
    const shouldAudit = auditableActions.includes(request.method);

    if (!shouldAudit || !user) {
      return next.handle();
    }

    const action = `${request.method}_${request.route?.path || request.url}`;
    const resourceType = this.extractResourceType(request.url);
    const resourceId = request.params?.id || null;

    return next.handle().pipe(
      tap(async () => {
        try {
          await this.prisma.auditLog.create({
            data: {
              userId: user.userId,
              action,
              resourceType,
              resourceId,
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'] || null,
              timestamp: new Date(),
              details: {
                method: request.method,
                url: request.url,
                body: this.sanitizeBody(request.body),
              },
            },
          });
        } catch (error) {
          console.error('Audit logging failed:', error);
        }
      }),
    );
  }

  private extractResourceType(url: string): string {
    const match = url.match(/\/api\/([^\/]+)/);
    return match ? match[1] : 'unknown';
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;

    const sensitiveFields = ['password', 'passwordHash', 'mfaSecret', 'token'];
    const sanitized = { ...body };

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
