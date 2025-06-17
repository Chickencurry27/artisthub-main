'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Added useRouter
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link'; // Added Link for navigation

// Updated password complexity regex (example: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const PASSWORD_POLICY_MESSAGE = 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.';


export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter(); // Initialize router
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true until token is processed
  const [tokenInitiallyChecked, setTokenInitiallyChecked] = useState(false);


  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setToken(resetToken);
      // Basic validation: check if token string exists.
      // More complex client-side validation (e.g. format) could be added here if needed,
      // but server-side validation is crucial.
      console.log(`Token found in URL: ${resetToken}`);
      setError(null); // Clear any "no token" error
    } else {
      setError('Password reset token not found in URL or it is invalid. Please check the link or request a new one.');
      console.error('No token found in URL.');
    }
    setLoading(false); // Finished processing token
    setTokenInitiallyChecked(true);
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('A valid password reset token is required. Please ensure the URL is correct or request a new link.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      setError(PASSWORD_POLICY_MESSAGE);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An unexpected error occurred. Please try again.');
      } else {
        setSuccess(data.message || 'Your password has been reset successfully! You can now log in with your new password.');
        setPassword('');
        setConfirmPassword('');
        // Optionally redirect to login page after a delay
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Password reset API call error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Display loading state while token is being checked initially
  if (!tokenInitiallyChecked && loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-muted/40">
        <Card className="w-full max-w-md p-6">
          <CardHeader>
            <CardTitle>Verifying Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading, please wait...</p>
            {/* You could add a spinner here */}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md p-4 sm:p-6">
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
          {!success && (
            <CardDescription>
              {token ? 'Enter your new password below.' : 'No valid password reset token found. Please ensure you have the correct link.'}
            </CardDescription>
          )}
        </CardHeader>

        {!success && token && (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  disabled={loading}
                />
              </div>
               {error && <p className="text-sm text-red-600 mt-2 p-3 bg-red-50 border border-red-200 rounded-md">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col items-stretch">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Resetting Password...' : 'Set New Password'}
              </Button>
            </CardFooter>
          </form>
        )}

        {success && (
          <CardContent className="space-y-4">
            <p className="text-sm text-green-700 p-3 bg-green-50 border border-green-200 rounded-md">{success}</p>
            <Button asChild className="w-full">
              <Link href="/login">Proceed to Login</Link>
            </Button>
          </CardContent>
        )}

        {!token && error && tokenInitiallyChecked && (
          <CardContent className="space-y-4">
            <p className="text-sm text-red-600 p-3 bg-red-50 border border-red-200 rounded-md">{error}</p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/forgot-password">Request New Reset Link</Link>
            </Button>
            <Button variant="link" asChild className="w-full">
              <Link href="/login">Back to Login</Link>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
