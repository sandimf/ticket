'use client';
import { useRegister, RegisterInput } from '@/hooks/useRegister';
import { useState } from 'react';

export default function Register() {
  const { mutate: register, isPending, isError, isSuccess, error } = useRegister();
  const [form, setForm] = useState<RegisterInput>({
    username: '',
    email: '',
    full_name: '',
    phone_number: '',
    password: '',
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(form);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-sm mx-auto">
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium">Username</label>
        <input id="username" name="username" value={form.username} onChange={onChange} required className="w-full rounded border px-3 py-2" />
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input id="email" type="email" name="email" value={form.email} onChange={onChange} required className="w-full rounded border px-3 py-2" />
      </div>
      <div className="space-y-2">
        <label htmlFor="full_name" className="text-sm font-medium">Nama Lengkap</label>
        <input id="full_name" name="full_name" value={form.full_name} onChange={onChange} required className="w-full rounded border px-3 py-2" />
      </div>
      <div className="space-y-2">
        <label htmlFor="phone_number" className="text-sm font-medium">Nomor Telepon</label>
        <input id="phone_number" name="phone_number" value={form.phone_number} onChange={onChange} className="w-full rounded border px-3 py-2" />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <input id="password" type="password" name="password" value={form.password} onChange={onChange} required className="w-full rounded border px-3 py-2" />
      </div>
      <button type="submit" disabled={isPending} className="w-full rounded bg-black text-white py-2 disabled:opacity-50">
        {isPending ? 'Mendaftar...' : 'Daftar'}
      </button>
      {isError && <p className="text-red-600 text-sm">{error?.message || 'Terjadi kesalahan saat registrasi'}</p>}
      {isSuccess && <p className="text-green-600 text-sm">Registrasi berhasil. Silakan cek email untuk verifikasi.</p>}
    </form>
  );
}