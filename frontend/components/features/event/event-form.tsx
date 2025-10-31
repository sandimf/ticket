"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useCreateEvent } from "@/hooks/useCreateEvent";
import { toast } from "sonner";

// Pastikan import dari lokasi yang benar (sesuai struktur project Tuan)
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/dropzone";

export function EventForm() {
  const [city, setCity] = useState<string>("");
  const { mutateAsync, isPending } = useCreateEvent();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [status, setStatus] = useState<string>("draft");
  const [posterFiles, setPosterFiles] = useState<File[] | undefined>();

  const handleDrop = (files: File[]) => {
    console.log(files);
    setPosterFiles(files);
  };

  const [ticketTypes, setTicketTypes] = useState<
    Array<{
      name: string;
      description: string;
      price: number;
      total_stock: number;
      sales_start_date?: Date;
      sales_end_date?: Date;
    }>
  >([{ name: "", description: "", price: 0, total_stock: 0 }]);

  const addTicketType = () => {
    setTicketTypes((prev) => [
      ...prev,
      { name: "", description: "", price: 0, total_stock: 0 },
    ]);
  };

  const removeTicketType = (index: number) => {
    setTicketTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTicketType = (index: number, field: string, value: any) => {
    setTicketTypes((prev) =>
      prev.map((tt, i) => (i === index ? { ...tt, [field]: value } : tt))
    );
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (posterFiles?.[0]) formData.set("poster_image", posterFiles[0]);
    if (startDate) formData.set("start_datetime", startDate.toISOString());
    if (endDate) formData.set("end_datetime", endDate.toISOString());
    formData.set("status", status);
    formData.set("city", city);

    try {
      const created = await mutateAsync(formData, { onSuccess: () => { } });
      const eventId = (created as any)?.id;
      if (!eventId) throw new Error("Event ID tidak ditemukan");

      const validTicketTypes = ticketTypes.filter(
        (tt) => tt.name && tt.price > 0 && tt.total_stock > 0
      );

      if (validTicketTypes.length > 0) {
        await Promise.all(
          validTicketTypes.map(async (tt) => {
            const res = await fetch("/api/ticket-type", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                event_id: eventId,
                name: tt.name,
                description: tt.description,
                price: tt.price,
                total_stock: tt.total_stock,
                sales_start_date: tt.sales_start_date
                  ? tt.sales_start_date.toISOString()
                  : undefined,
                sales_end_date: tt.sales_end_date
                  ? tt.sales_end_date.toISOString()
                  : undefined,
              }),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err?.message || "Gagal membuat ticket type");
            }
          })
        );
      }

      toast.success("Event dan tiket berhasil dibuat!");
      window.location.href = "/events";
    } catch (error: any) {
      toast.error(error?.message || "Gagal membuat event/tiket");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* --- Poster Upload --- */}
      <div className="space-y-2">
        <Label htmlFor="poster_image">Poster Event</Label>
        <Dropzone
          accept={{ "image/*": [] }}
          maxFiles={1}
          maxSize={1024 * 1024 * 5}
          minSize={1024}
          onDrop={handleDrop}
          onError={console.error}
          src={posterFiles}
          disabled={isPending}
        >
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
      </div>
      <span>Diselengarakan Oleh: sandi</span>

      {/* --- Judul --- */}
      <div className="space-y-2">
        <Label htmlFor="title">Judul Event</Label>
        <Input
          id="title"
          name="title"
          placeholder="Judul Event"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Jelaskan event Anda..."
          disabled={isPending}
        />
      </div>

      {/* --- Venue & Kota --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="venue_name">Nama Venue / Lokasi</Label>
          <Input
            id="venue_name"
            name="venue_name"
            placeholder="Nama Venue / Lokasi"
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Kota</Label>
          <Select
            name="city"
            disabled={isPending}
            value={city}
            onValueChange={(value) => setCity(value)}
          >
            <SelectTrigger id="city" className="w-full">
              <SelectValue placeholder="Pilih kota" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jakarta">Jakarta</SelectItem>
              <SelectItem value="bandung">Bandung</SelectItem>
              <SelectItem value="surabaya">Surabaya</SelectItem>
              <SelectItem value="medan">Medan</SelectItem>
              <SelectItem value="yogyakarta">Yogyakarta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- Kategori & Status --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="category">Kategori</Label>
          <Input
            id="category"
            name="category"
            placeholder="Konser / Workshop / Sport"
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={setStatus}
            disabled={isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih status event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft (Disimpan)</SelectItem>
              <SelectItem value="published">Published (Umum)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- Tanggal --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="startDate">Tanggal Mulai</Label>
          <input
            id="startDate"
            type="date"
            value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
            onChange={(e) => setStartDate(new Date(e.target.value))}
            disabled={isPending}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <Label htmlFor="endDate">Tanggal Berakhir</Label>
          <input
            id="endDate"
            type="date"
            value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
            onChange={(e) => setEndDate(new Date(e.target.value))}
            disabled={isPending}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <div className="space-y-4">
        <Label className="text-base">Tiket</Label>
        {ticketTypes.map((tt, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end border p-3 rounded-md"
          >
            <div className="md:col-span-2 space-y-2">
              <Label>Nama Tiket</Label>
              <Input
                value={tt.name}
                onChange={(e) =>
                  updateTicketType(index, "name", e.target.value)
                }
                placeholder="VIP / Regular"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Deskripsi</Label>
              <Input
                value={tt.description}
                onChange={(e) =>
                  updateTicketType(index, "description", e.target.value)
                }
                placeholder="Kursi depan, dll"
              />
            </div>
            <div className="space-y-2">
              <Label>Harga</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={
                  tt.price
                    ? `Rp ${new Intl.NumberFormat("id-ID").format(tt.price)}`
                    : ""
                }
                onChange={(e) => {
                  // Hilangkan semua karakter kecuali angka
                  const raw = e.target.value.replace(/\D/g, "");
                  const numericValue = raw ? parseInt(raw, 10) : 0;
                  updateTicketType(index, "price", numericValue);
                }}
                placeholder="Rp 10.000"
              />
            </div>


            <div className="space-y-2">
              <Label>Stok</Label>
              <Input
                type="number"
                min={0}
                value={tt.total_stock}
                onChange={(e) =>
                  updateTicketType(index, "total_stock", Number(e.target.value))
                }
              />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label>Mulai Penjualan</Label>
              <Input
                type="datetime-local"
                onChange={(e) =>
                  updateTicketType(
                    index,
                    "sales_start_date",
                    e.target.value ? new Date(e.target.value) : undefined
                  )
                }
              />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label>Berakhir Penjualan</Label>
              <Input
                type="datetime-local"
                onChange={(e) =>
                  updateTicketType(
                    index,
                    "sales_end_date",
                    e.target.value ? new Date(e.target.value) : undefined
                  )
                }
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => removeTicketType(index)}
              >
                Hapus
              </Button>
              {index === ticketTypes.length - 1 && (
                <Button type="button" onClick={addTicketType}>
                  Tambah Tiket
                </Button>
              )}
            </div>
          </div>
        ))}
        {ticketTypes.length === 0 && (
          <Button type="button" onClick={addTicketType}>
            Tambah Tiket
          </Button>
        )}
      </div>

      {/* --- Submit --- */}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Menyimpan..." : "Buat Event"}
      </Button>
    </form>
  );
}
