import { Injectable, Logger } from '@nestjs/common';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  /**
   * Send an email verification link
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    const html = `
      <h1>Welcome to Shepherd App!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    `;

    const text = `Welcome to Shepherd App! Please verify your email by visiting: ${verificationUrl}. This link will expire in 24 hours.`;

    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email - Shepherd App',
      html,
      text,
    });
  }

  /**
   * Send a password reset link
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the link below to continue:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
    `;

    const text = `You requested to reset your password. Visit: ${resetUrl}. This link will expire in 1 hour.`;

    await this.sendEmail({
      to: email,
      subject: 'Password Reset - Shepherd App',
      html,
      text,
    });
  }

  /**
   * Send notification to admin about new user registration
   */
  async sendNewUserNotificationToAdmin(userEmail: string, userName: string): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@church.org';
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/users/pending`;

    const html = `
      <h1>New User Registration</h1>
      <p>A new user has registered and is awaiting approval:</p>
      <ul>
        <li><strong>Name:</strong> ${userName}</li>
        <li><strong>Email:</strong> ${userEmail}</li>
      </ul>
      <p><a href="${dashboardUrl}">View Pending Users</a></p>
    `;

    const text = `New user registration: ${userName} (${userEmail}). View pending users at: ${dashboardUrl}`;

    await this.sendEmail({
      to: adminEmail,
      subject: 'New User Registration Pending Approval',
      html,
      text,
    });
  }

  /**
   * Send approval confirmation to user
   */
  async sendUserApprovedEmail(email: string, firstName: string): Promise<void> {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;

    const html = `
      <h1>Account Approved!</h1>
      <p>Hi ${firstName},</p>
      <p>Your account has been approved by an administrator. You can now access all features of Shepherd App.</p>
      <p><a href="${loginUrl}">Login Now</a></p>
    `;

    const text = `Hi ${firstName}, your account has been approved! Login at: ${loginUrl}`;

    await this.sendEmail({
      to: email,
      subject: 'Your Account Has Been Approved - Shepherd App',
      html,
      text,
    });
  }

  /**
   * Core email sending method
   * TODO: Replace with actual email service (SendGrid, AWS SES, etc.)
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    // For now, log emails to console
    // In production, integrate with SendGrid, AWS SES, or other email service
    this.logger.log(`
      ==================== EMAIL ====================
      To: ${options.to}
      Subject: ${options.subject}
      Text: ${options.text || 'N/A'}
      HTML: ${options.html}
      ===============================================
    `);

    // TODO: Implement actual email sending
    // Example with nodemailer:
    // await this.transporter.sendMail({
    //   from: process.env.EMAIL_FROM,
    //   to: options.to,
    //   subject: options.subject,
    //   text: options.text,
    //   html: options.html,
    // });
  }
}
