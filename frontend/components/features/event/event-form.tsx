"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  Loader2,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { useCreateEvent } from "@/hooks/useCreateEvent";
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // Pastikan Anda mengimpor utilitas 'cn'

// Shadcn UI Components
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/dropzone";

// Tipe data untuk tiket (disesuaikan untuk Date object)
type TicketType = {
  name: string;
  description: string;
  price: number;
  total_stock: number;
  sales_start_date?: Date;
  sales_end_date?: Date;
};

export function EventForm() {
  const [city, setCity] = useState<string>("");
  const { mutateAsync, isPending } = useCreateEvent();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [status, setStatus] = useState<string>("draft");
  const [posterFiles, setPosterFiles] = useState<File[] | undefined>();

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { name: "", description: "", price: 0, total_stock: 0 },
  ]);

  const addTicketType = () => {
    setTicketTypes((prev) => [
      ...prev,
      { name: "", description: "", price: 0, total_stock: 0 },
    ]);
  };

  const removeTicketType = (index: number) => {
    setTicketTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTicketType = (
    index: number,
    field: keyof TicketType,
    value: any
  ) => {
    setTicketTypes((prev) =>
      prev.map((tt, i) => (i === index ? { ...tt, [field]: value } : tt))
    );
  };

  const handleDrop = (files: File[]) => {
    console.log(files);
    setPosterFiles(files);
  };

  // Logika submit tetap sama
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (posterFiles?.[0]) formData.set("poster_image", posterFiles[0]);
    if (startDate) formData.set("start_datetime", startDate.toISOString());
    if (endDate) formData.set("end_datetime", endDate.toISOString());
    formData.set("status", status);
    formData.set("city", city);

    try {
      const created = await mutateAsync(formData, { onSuccess: () => {} });
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
    <form onSubmit={onSubmit} className="space-y-8">
      {/* --- Card 1: Detail Event --- */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Event</CardTitle>
          <CardDescription>
            Informasi dasar mengenai event Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="poster_image">Poster Event</Label>
            <Dropzone
              accept={{ "image/*": [] }}
              maxFiles={1}
              maxSize={1024 * 1024 * 5}
              onDrop={handleDrop}
              onError={console.error}
              src={posterFiles}
              disabled={isPending}
            >
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Judul Event</Label>
            <Input
              id="title"
              name="title"
              placeholder="Mis: Konser Amal"
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
              rows={5}
            />
          </div>
        </CardContent>
      </Card>

      {/* --- Card 2: Waktu & Lokasi --- */}
      <Card>
        <CardHeader>
          <CardTitle>Waktu & Lokasi</CardTitle>
          <CardDescription>
            Kapan dan di mana event akan diadakan.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="venue_name">Nama Venue / Lokasi</Label>
            <Input
              id="venue_name"
              name="venue_name"
              placeholder="Mis: Stadion Gelora"
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
              onValueChange={setCity}
            >
              <SelectTrigger id="city">
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

          <div className="space-y-2">
            <Label htmlFor="startDate">Tanggal Mulai</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                  disabled={isPending}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "PPP")
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Tanggal Berakhir</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                  disabled={isPending}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? (
                    format(endDate, "PPP")
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* --- Card 3: Kategori & Status --- */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori & Status</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select name="category" required disabled={isPending}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="konser">Konser</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="sport">Sport</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={setStatus}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft (Disimpan)</SelectItem>
                <SelectItem value="published">Published (Umum)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* --- Bagian 4: Tipe Tiket --- */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Tipe Tiket</h2>
        {ticketTypes.map((tt, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tiket #{index + 1}</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTicketType(index)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nama Tiket</Label>
                  <Input
                    value={tt.name}
                    onChange={(e) =>
                      updateTicketType(index, "name", e.target.value)
                    }
                    placeholder="Mis: VIP, Reguler"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Input
                    value={tt.description}
                    onChange={(e) =>
                      updateTicketType(index, "description", e.target.value)
                    }
                    placeholder="Mis: Kursi depan, Early Bird"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Harga</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={
                      tt.price
                        ? `Rp ${new Intl.NumberFormat("id-ID").format(
                            tt.price
                          )}`
                        : ""
                    }
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      updateTicketType(index, "price", raw ? parseInt(raw) : 0);
                    }}
                    placeholder="Rp 0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stok</Label>
                  <Input
                    type="number"
                    min={0}
                    value={tt.total_stock}
                    onChange={(e) =>
                      updateTicketType(
                        index,
                        "total_stock",
                        Number(e.target.value)
                      )
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Mulai Penjualan</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tt.sales_start_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tt.sales_start_date ? (
                          format(tt.sales_start_date, "PPP")
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={tt.sales_start_date}
                        onSelect={(date) =>
                          updateTicketType(index, "sales_start_date", date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Berakhir Penjualan</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tt.sales_end_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tt.sales_end_date ? (
                          format(tt.sales_end_date, "PPP")
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={tt.sales_end_date}
                        onSelect={(date) =>
                          updateTicketType(index, "sales_end_date", date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={addTicketType}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Tipe Tiket
        </Button>
      </div>

      {/* --- Submit --- */}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full text-lg py-6"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Menyimpan..." : "Buat Event"}
      </Button>
    </form>
  );
}