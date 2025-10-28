'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FooterPattern from '../global/FooterPattern';

export default function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'No user found with this email') {
          setError('No account found with this email. Please sign up first.');
        } else {
          setError(result.error);
        }
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      setError('An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 border-2 border-slate-600 brutal-shadow-left rounded-lg relative z-10">
        <div>
          <h2 className="heading-text-2 text-5xl font-anton text-center mb-3">
            SIGN IN
          </h2>
          <p className="mt-2 text-center text-lg font-freeman text-slate-300">
            Or{' '}
            <Link href="/auth/signup" className="text-cyan-400 underline hover:text-white transition-all duration-300">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900 border-2 border-red-600 p-4 rounded" role="alert">
              <span className="block font-freeman text-red-200">{error}</span>
              {error.includes('No account found') && (
                <div className="mt-2">
                  <Link href="/auth/signup" className="text-red-200 hover:text-white font-semibold underline">
                    Click here to sign up
                  </Link>
                </div>
              )}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="font-freeman block mb-2 text-white">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 bg-slate-700 border-2 border-slate-600 font-freeman focus:outline-none focus:border-primary brutal-shadow-center text-white rounded"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="font-freeman block mb-2 text-white">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 bg-slate-700 border-2 border-slate-600 font-freeman focus:outline-none focus:border-primary brutal-shadow-center text-white rounded"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="button-primary neopop-gradient-primary w-full py-2 px-4 font-freeman text-xl text-white hover:neopop-glow rounded"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
      <FooterPattern design={1} className=' w-[80vw] bottom-0 right-0 opacity-30' />
      <FooterPattern design={1} className=' w-[80vw] top-0 left-0 -scale-100 opacity-30' />
    </div>
  );
} 