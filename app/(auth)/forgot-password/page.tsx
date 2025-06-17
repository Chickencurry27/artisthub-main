'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link'; // Added Link import

export default function ForgotPasswordEmailEntryPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!email) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Even if user not found (404), show a generic message for security.
        // Specific errors (e.g., server error 500) can be handled differently if needed.
        if (response.status === 404) {
             setSuccess('If an account with this email exists, a password reset link has been sent.');
        } else {
            setError(data.error || 'An unexpected error occurred. Please try again.');
        }
      } else {
        setSuccess('If an account with this email exists, a password reset link has been sent.');
        setEmail(''); // Clear email field on success
      }
    } catch (err) {
      console.error('Forgot password request error:', err);
      setError('Failed to send request. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Your Password?</CardTitle>
          <CardDescription>
            Enter your email address below and we&apos;ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            {error && <p className="text-sm text-red-600 mb-4 p-2 bg-red-100 border border-red-300 rounded-md">{error}</p>}
            {success && <p className="text-sm text-green-600 mb-4 p-3 bg-green-100 border border-green-300 rounded-md">{success}</p>}
            <Button type="submit" className="w-full mb-2" disabled={loading}>
              {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </Button>
            <Button variant="link" asChild>
                 <Link href="/login">Back to Login</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
