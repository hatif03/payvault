'use client';

import loadericon from '@/assets/loader_2.svg';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import FooterPattern from '../global/FooterPattern';

export default function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // First, register the user
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        setLoading(false);
        if (registerData.error.includes('already exists')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(registerData.error);
        }
        return;
      }

      // If registration successful, sign in the user
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setLoading(false);
        setError('Registration successful but sign-in failed. Please try signing in manually.');
      } else if (result?.ok) {
        router.push('/dashboard');
      } else {
        setLoading(false);
        setError('Registration successful but sign-in failed. Please try signing in manually.');
      }
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
      setLoading(false);
    } 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-lg w-full space-y-8 bg-slate-800 p-8 border-2 border-slate-600 brutal-shadow-left rounded-lg relative z-10">
        <div>
          <h2 className="heading-text-2 text-5xl font-anton text-center mb-3">
            SIGN UP
          </h2>
          <p className="mt-2 text-center text-lg font-freeman text-slate-300">
            Or{' '}
            <Link href="/auth/signin" className="text-cyan-400 underline hover:text-white transition-all duration-300">
              sign in to your account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900 border-2 border-red-600 p-4 rounded" role="alert">
              <span className="block font-freeman text-red-200">{error}</span>
              {error.includes('already exists') && (
                <div className="mt-2">
                  <Link href="/auth/signin" className="text-red-200 hover:text-white underline">
                    Click here to sign in
                  </Link>
                </div>
              )}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="font-freeman block mb-2 text-white">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-3 py-2 bg-slate-700 border-2 border-slate-600 font-freeman focus:outline-none focus:border-primary brutal-shadow-center text-white rounded"
                placeholder="Enter your full name"
              />
            </div>
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
              {loading ? <span className='w-full flex gap-2 items-center justify-center'><Image src={loadericon} alt="loader" className='w-6 h-6 animate-spin' />Creating your dashboard</span> : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
      <FooterPattern design={1} className=' w-[80vw] bottom-0 right-0 opacity-30' />
      <FooterPattern design={1} className=' w-[80vw] top-0 left-0 -scale-100 opacity-30' />
    </div>
  );
} 