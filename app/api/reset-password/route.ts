import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcrypt'; // For hashing the new password

const prisma = new PrismaClient();
const SALT_ROUNDS = 10; // Standard salt rounds for bcrypt

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Reset token is required.' }, { status: 400 });
    }
    if (!newPassword) {
      return NextResponse.json({ error: 'New password is required.' }, { status: 400 });
    }

    // Basic password complexity check (optional, can be enhanced)
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    // Hash the raw token received from the client to match the stored hashed token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find the user by the hashed password reset token
    const user = await prisma.user.findUnique({
      where: { passwordResetToken: hashedToken },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired password reset token. Please request a new one.' }, { status: 400 });
    }

    // Check if the token has expired
    if (!user.passwordResetTokenExpiresAt || user.passwordResetTokenExpiresAt < new Date()) {
      // Token expired, clear it from DB to prevent reuse
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: null,
          passwordResetTokenExpiresAt: null,
        },
      });
      return NextResponse.json({ error: 'Password reset token has expired. Please request a new one.' }, { status: 400 });
    }

    // Hash the new password
    const newHashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update the user's password and invalidate the reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword: newHashedPassword,
        passwordResetToken: null, // Invalidate the token
        passwordResetTokenExpiresAt: null, // Clear expiry
      },
    });

    console.log(`Password successfully reset for user: ${user.email}`);
    return NextResponse.json({ message: 'Password has been reset successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Reset password error:', error);
    if (error instanceof SyntaxError) { // JSON parsing error
        return NextResponse.json({ error: 'Invalid request body. Please ensure it is valid JSON.' }, { status: 400 });
    }
    // Generic error for other cases to avoid leaking details
    return NextResponse.json({ error: 'An internal server error occurred while resetting the password.' }, { status: 500 });
  }
}
