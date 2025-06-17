import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Find the user by email using Prisma
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // User not found. For security, don't reveal that the email isn't registered.
      // Log this server-side for monitoring, if desired.
      console.log(`Password reset requested for non-existent user: ${email}`);
      // Return a generic success message to prevent email enumeration.
      return NextResponse.json({ message: 'If your email is registered, you will receive a password reset link.' }, { status: 200 });
    }

    // 2. Generate a unique, secure password reset token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const tokenExpiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // 3. Store the hashed token and its expiry date in the User model
    try {
      await prisma.user.update({
        where: { email },
        data: {
          passwordResetToken: hashedToken,
          passwordResetTokenExpiresAt: tokenExpiresAt,
        },
      });
      console.log(`Stored password reset token for ${email}. Hashed token (first 8 chars): ${hashedToken.substring(0,8)}...`);
    } catch (dbError) {
      console.error('Database error storing password reset token:', dbError);
      return NextResponse.json({ error: 'Failed to process password reset request due to a database error.' }, { status: 500 });
    }

    // 4. Send an email with Nodemailer using the raw token
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`; // Send the raw token in email

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      to: email,
      subject: 'Reset Your Password for ClientHub', // Updated subject
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="text-align: center; color: #007bff;">ClientHub Password Reset</h2>
            <p>Hello ${user.name || 'ClientHub User'},</p>
            <p>You are receiving this email because a password reset was requested for the account associated with ${email}.</p>
            <p>To reset your password, please click on the link below. This link is valid for 1 hour.</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </p>
            <p>If the button above doesn't work, copy and paste the following URL into your web browser:</p>
            <p><a href="${resetUrl}" style="color: #007bff; word-break: break-all;">${resetUrl}</a></p>
            <p>If you did not request this password reset, please ignore this email. Your password will remain unchanged and your account is secure.</p>
            <hr style="border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 0.9em; color: #555;">Thank you,<br />The ClientHub Team</p>
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}. Raw token (first 8 chars): ${rawToken.substring(0,8)}...`);
      return NextResponse.json({ message: 'Password reset email sent successfully. Please check your inbox.' }, { status: 200 });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Attempt to clear the token if email sending fails, to allow retry, though this might hide the original DB error if that also fails.
      try {
        await prisma.user.update({
            where: { email },
            data: {
                passwordResetToken: null,
                passwordResetTokenExpiresAt: null,
            },
        });
      } catch (clearTokenError) {
        console.error('Failed to clear reset token after email send failure:', clearTokenError);
      }
      return NextResponse.json({ error: 'Failed to send password reset email. Please try again later.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Forgot password main error handler:', error);
    if (error instanceof SyntaxError) { // JSON parsing error
        return NextResponse.json({ error: 'Invalid request body. Please ensure it is valid JSON.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
