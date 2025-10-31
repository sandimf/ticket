'use client';
import { useState } from 'react';
import { useLogin } from '@/hooks/useLogin';

export default function Login() {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: login, isPending, isError } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ identity, password });
  };

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
      {isError && <p className="text-red-600 text-sm">Terjadi kesalahan saat login</p>}
    </form>
  );
}
