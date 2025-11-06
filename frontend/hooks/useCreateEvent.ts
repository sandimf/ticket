import { useMutation } from "@tanstack/react-query";
import { Event } from "@/types/type";

// Fungsi mutation sekarang hanya menerima FormData dan mengembalikan Event (json.data)
const createEvent = async (formData: FormData): Promise<Event> => {
  const response = await fetch("/api/events", {
    method: "POST",
    body: formData,
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json?.message || "Gagal membuat event baru");
  }

  // Normalisasi: backend mengirim { status, message, data: event }
  const data = json?.data ?? json;
  return data as Event;
};

export const useCreateEvent = () => {
  return useMutation({
    // Tipe data di sini adalah FormData, hasilnya Event
    mutationFn: (formData: FormData) => createEvent(formData),
  });
};