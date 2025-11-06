"use client";

import { useEffect, useState } from "react";

export default function PaymentPage({ params }: { params: Promise<{ invoice: string }> }) {
  const [invoiceCode, setInvoiceCode] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const loadParams = async () => {
      const resolved = await params;
      setInvoiceCode(resolved.invoice);
    };
    loadParams();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage("Silakan pilih file bukti pembayaran");
      return;
    }
    if (!fullName || !phoneNumber) {
      setMessage("Nama lengkap dan nomor telepon wajib diisi");
      return;
    }
    setIsSubmitting(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("payment_proof", file);
      formData.append("full_name", fullName);
      formData.append("phone_number", phoneNumber);

      const res = await fetch(`/api/orders/invoice/${invoiceCode}/payment-proof`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Gagal mengunggah bukti pembayaran");
      } else {
        setMessage("Bukti pembayaran berhasil diunggah. Terima kasih!");
      }
    } catch (error) {
      console.error(error);
      setMessage("Terjadi kesalahan tak terduga");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Upload Bukti Pembayaran</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Nama Lengkap</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="Nama sesuai transfer"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Nomor Telepon</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="Nomor yang bisa dihubungi"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">File Bukti Pembayaran</label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border rounded px-3 py-2 w-full"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isSubmitting ? "Mengunggah..." : "Kirim Bukti"}
        </button>
      </form>
      {message && (
        <p className="mt-4 text-sm">{message}</p>
      )}
    </div>
  );
}