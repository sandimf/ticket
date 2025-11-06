"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Banner } from "@/types/type";
import { createBanner, updateBanner, deleteBanner, getBannersServer } from "@/lib/api/banner-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/keys";

export default function AdminBannersClient() {
  const queryClient = useQueryClient();
  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: queryKeys.banners.all,
    queryFn: getBannersServer,
  });

  const createMut = useMutation({
    mutationFn: async (payload: { title?: string; link_url?: string; active?: boolean; order?: number; image?: File }) => {
      const fd = new FormData();
      if (payload.title) fd.append("title", payload.title);
      if (payload.link_url) fd.append("link_url", payload.link_url);
      if (typeof payload.active === "boolean") fd.append("active", String(payload.active));
      if (typeof payload.order === "number") fd.append("order", String(payload.order));
      if (payload.image) fd.append("image", payload.image);
      return createBanner(fd);
    },
    onSuccess: () => {
      toast.success("Banner dibuat");
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.all });
    },
    onError: (e: any) => toast.error(e?.message || "Gagal membuat banner"),
  });

  const updateMut = useMutation({
    mutationFn: async (payload: { id: number; title?: string; link_url?: string; active?: boolean; order?: number; image?: File | null }) => {
      const { id, ...rest } = payload;
      let body: FormData | Record<string, any>;
      if (rest.image) {
        const fd = new FormData();
        if (rest.title) fd.append("title", rest.title);
        if (rest.link_url) fd.append("link_url", rest.link_url);
        if (typeof rest.active === "boolean") fd.append("active", String(rest.active));
        if (typeof rest.order === "number") fd.append("order", String(rest.order));
        fd.append("image", rest.image);
        body = fd;
      } else {
        body = rest;
      }
      return updateBanner(id, body);
    },
    onSuccess: () => {
      toast.success("Banner diperbarui");
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.all });
    },
    onError: (e: any) => toast.error(e?.message || "Gagal memperbarui banner"),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => deleteBanner(id),
    onSuccess: () => {
      toast.success("Banner dihapus");
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.all });
    },
    onError: (e: any) => toast.error(e?.message || "Gagal menghapus banner"),
  });

  const [form, setForm] = useState<{ title: string; link_url: string; active: boolean; order: number; image?: File }>({
    title: "",
    link_url: "",
    active: true,
    order: 0,
    image: undefined,
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSubmit = () => {
    if (editingId) {
      updateMut.mutate({ id: editingId, ...form });
      setEditingId(null);
    } else {
      createMut.mutate(form);
    }
    setForm({ title: "", link_url: "", active: true, order: 0, image: undefined });
  };

  if (isLoading) {
    return <div className="p-6">Memuat data banners...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Admin Banners</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Judul</Label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <Label>Link URL</Label>
            <Input value={form.link_url} onChange={(e) => setForm((f) => ({ ...f, link_url: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.active} onCheckedChange={(v) => setForm((f) => ({ ...f, active: !!v }))} />
            <Label>Aktif</Label>
          </div>
          <div>
            <Label>Order</Label>
            <Input type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} />
          </div>
          <div>
            <Label>Gambar</Label>
            <Input type="file" accept="image/*" onChange={(e) => setForm((f) => ({ ...f, image: e.target.files?.[0] || undefined }))} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}>
            {editingId ? "Simpan Perubahan" : "Tambah Banner"}
          </Button>
          {editingId && (
            <Button variant="outline" onClick={() => { setEditingId(null); setForm({ title: "", link_url: "", active: true, order: 0, image: undefined }); }}>
              Batal Edit
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gambar</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  {b.image_url ? (
                    <img src={b.image_url} alt={b.title} className="h-12 w-20 object-cover rounded" />
                  ) : (
                    <span>-</span>
                  )}
                </TableCell>
                <TableCell>{b.title || "-"}</TableCell>
                <TableCell>{b.link_url || "-"}</TableCell>
                <TableCell>{b.active ? "Ya" : "Tidak"}</TableCell>
                <TableCell>{b.order ?? 0}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditingId(b.id);
                    setForm({ title: b.title || "", link_url: b.link_url || "", active: !!b.active, order: b.order ?? 0, image: undefined });
                  }}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMut.mutate(b.id)}>
                    Hapus
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}