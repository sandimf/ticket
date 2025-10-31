import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Event } from "@/types/type";
import { queryKeys } from "@/lib/query/keys";

// --- 🚀 PERUBAHAN DI SINI ---
// Fungsi mutation sekarang hanya menerima FormData
const createEvent = async (formData: FormData): Promise<Event> => {
  // Langsung kirim FormData.
  // Browser akan otomatis mengatur Content-Type: multipart/form-data
  const response = await fetch("/api/events", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Gagal membuat event baru");
  }

  return response.json();
};
// -----------------------------

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    // Tipe data di sini sekarang adalah FormData
    mutationFn: (formData: FormData) => createEvent(formData),

    onSuccess: (data) => {
      toast.success(`Event "${data.title}" berhasil dibuat!`);
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      router.push("/events"); // Redirect setelah sukses
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};