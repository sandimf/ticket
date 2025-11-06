import { Banner } from "@/types/type";

// Di file lib/api/banner-api.ts (atau file terpisah)

// FUNGSI INI HANYA UNTUK SERVER COMPONENT
export const getBannersServer = async (): Promise<Banner[]> => {
  const GO_URL = process.env.GO_BACKEND_URL || "http://localhost:5000/api";
  
  const response = await fetch(`${GO_URL}/banner`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil data banner di server");
  }

  const json = await response.json();
  
  const data = Array.isArray(json) ? json : json?.data;
  
  if (!Array.isArray(data)) {
    throw new Error("Format data banner tidak valid. Periksa terminal untuk melihat respons asli.");
  }
  
  return data;
};


export const createBanner = async (payload: FormData): Promise<any> => {
  const res = await fetch(`/api/banners`, {
    method: "POST",
    body: payload,
  });
  if (!res.ok) {
    throw new Error("Gagal membuat banner");
  }
  return res.json();
};

export const updateBanner = async (
  id: number,
  payload: FormData | Record<string, any>
): Promise<any> => {
  const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
  const res = await fetch(`/api/banners/${id}`, {
    method: "PATCH",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? (payload as FormData) : JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Gagal memperbarui banner");
  }
  return res.json();
};

export const deleteBanner = async (id: number): Promise<any> => {
  const res = await fetch(`/api/banners/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Gagal menghapus banner");
  }
  return res.json();
};