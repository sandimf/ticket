'use client';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();

  // Auto redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      redirect: false,
      identity,
      password,
    });
    if (res?.ok) {
      // Legacy cookies already set by /api/auth/login route; NextAuth session is active
      router.push('/');
    }
  };

  const isPending = status === 'loading';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
      <div className="space-y-2">
        <label htmlFor="identity" className="text-sm font-medium">Email atau Username</label>
        <input
          id="identity"
          type="text"
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
          placeholder="contoh: user@email.com atau username"
          required
          className="w-full rounded border px-3 py-2"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded border px-3 py-2"
        />
      </div>
      <button type="submit" disabled={isPending} className="w-full rounded bg-black text-white py-2 disabled:opacity-50">
        {isPending ? 'Masuk...' : 'Masuk'}
      </button>
    </form>
  );
}
