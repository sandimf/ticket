"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus({ ok: false, message: "Token verifikasi tidak ditemukan" });
        return;
      }
      try {
        const res = await fetch(`/api/auth/verify?token=${token}`);
        const data = await res.json();
        if (!res.ok) {
          setStatus({ ok: false, message: data.error || "Verifikasi gagal" });
        } else {
          setStatus({ ok: true, message: data.message || "Verifikasi berhasil" });
        }
      } catch (e) {
        setStatus({ ok: false, message: "Terjadi kesalahan server" });
      }
    }
    verify();
  }, [token]);

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Verifikasi Akun</h1>
      {!status && <p>Memverifikasi token...</p>}
      {status && (
        <p className={status.ok ? "text-green-600" : "text-red-600"}>{status.message}</p>
      )}
    </div>
  );
}