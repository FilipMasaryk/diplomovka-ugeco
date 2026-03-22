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
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const initUrl = `${baseUrl}/initialize-password/${initToken}`;
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
      // email sent successfully
    } catch (err) {
      console.error('Failed to send init email:', err);
      throw new BadRequestException('Could not send welcome email');
    }
  }

  async sendResetEmail(to: string, resetToken: string) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;
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
      // email sent successfully
    } catch (err) {
      console.error('Failed to send password reset email:', err);
      throw new BadRequestException('Could not send password reset email');
    }
  }
}
