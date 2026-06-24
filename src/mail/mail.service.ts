import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { BookingEntity } from '../database/booking.entity';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailService.name);
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
    this.fromAddress =
      this.configService.get<string>('RESEND_FROM') ?? 'onboarding@resend.dev';
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject: 'Your verification code',
      html: `<p>Your OTP code is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
    });

    if (error) {
      this.logger.error(`Failed to send OTP to ${to}: ${error.message}`);
      throw new Error(error.message);
    }
  }

  async sendResetPasswordMail(to: string, link: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject: 'Reset Password Link',
      html: `<p>Hello,<p><p>You've requested to reset your password. Click on the following link to reset your password:</p><p><strong>${link}</strong></p><p>If you didn't request this, please ignore this email.</p><p>Thank you.</p>`,
    });

    if (error) {
      this.logger.error(
        `Failed to send reset password link to ${to}: ${error.message}`,
      );
      throw new Error(error.message);
    }
  }

  async sendHotelBookingMail(
    to: string,
    link: string,
    hotelBooking: BookingEntity,
  ): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject: 'Hotel Booking Confirmation',
      html: `
        <h1>Hotel Booking Confirmation</h1>
        <p>Hotel Name: ${hotelBooking?.hotel?.name}</p>
        <p>Hotel Address: ${hotelBooking?.hotel?.address?.detail}</p>
        <p>Hotel Phone: ${hotelBooking?.hotel?.phoneNumber}</p>
        <p>Hotel Email: ${hotelBooking?.hotel?.email}</p>
        <p>Check-in: ${hotelBooking?.checkInDate.toISOString()}</p>
        <p>Check-out: ${hotelBooking?.checkOutDate.toISOString()}</p>
        <p>Number of Guests: ${hotelBooking?.guestCount}</p>
        <p>Total Price: ${hotelBooking.totalPrice}</p>
        <p>Status: ${hotelBooking.status}</p>
        <p>Booking Code: ${hotelBooking.bookingCode}</p>
        <p>Payment Transaction Id: ${hotelBooking.paymentTransactionId}</p>
        <p>Thank you.</p>
      `,
    });

    if (error) {
      this.logger.error(
        `Failed to send hotel booking confirmation to ${to}: ${error.message}`,
      );
      throw new Error(error.message);
    }
  }
}
