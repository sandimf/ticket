import { Event } from "@/types/type";

// Fungsi ini sekarang bisa diimpor di server DAN di klien
export const getEvents = async (): Promise<Event[]> => {
  // Gunakan path relatif ke proxy Next.js agar bekerja di server/klien
  const response = await fetch(`/api/events`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Gagal mengambil data event");
  }

  const json = await response.json();
  // Normalisasi: backend bisa mengirim { data: [...] } atau langsung array
  const data = Array.isArray(json) ? json : json?.data;
  if (!Array.isArray(data)) {
    throw new Error("Format data event tidak valid");
  }
  return data;
};

