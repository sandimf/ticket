// Menyimpan semua query keys di satu tempat agar konsisten
export const queryKeys = {
  events: {
    all: ["events"] as const,
    detail: (id: string) => ["events", id] as const,
  },
  users: {
    all: ["users"] as const,
  },
  banners: {
    all: ["banners"] as const,
    detail: (id: string) => ["banners", id] as const,
  },
};