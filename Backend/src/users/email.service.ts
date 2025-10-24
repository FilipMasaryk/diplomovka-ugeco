import { Injectable, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SENDINBLUE_EMAIL,
        pass: process.env.SENDINBLUE_API_KEY,
      },
    });
  }

  async sendInitEmail(to: string, initToken: string) {
    const initUrl = `http://localhost:3000/auth/initialize-password/${initToken}`;
    try {
      await this.transporter.sendMail({
        from: `"Ugeco" <ugecotest@outlook.com>`,
        to,
        subject: 'Welcome! Set up your password',
        html: `
          <p>Your account has been created.</p>
          <p>Click the link below to set your password:</p>
          <a href="${initUrl}">${initUrl}</a>
        `,
      });
      console.log(`Init email sent to ${to}`);
    } catch (err) {
      console.error('Failed to send init email:', err);
      throw new BadRequestException('Could not send welcome email');
    }
  }

  async sendResetEmail(to: string, resetToken: string) {
    const resetUrl = `http://localhost:3000/auth/reset-password/${resetToken}`;
    try {
      await this.transporter.sendMail({
        from: `"Ugeco" <ugecotest@outlook.com>`,
        to,
        subject: 'Password Reset Request',
        html: `
          <p>You requested a password reset.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
        `,
      });
      console.log(`Password reset email sent to ${to}`);
    } catch (err) {
      console.error('Failed to send password reset email:', err);
      throw new BadRequestException('Could not send password reset email');
    }
  }
}
