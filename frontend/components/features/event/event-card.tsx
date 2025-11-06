import { Event } from "@/types/type";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const firstTicketPrice = event.ticket_types?.[0]?.price;
  const priceLabel =
    firstTicketPrice == null
      ? "—"
      : Number(firstTicketPrice) > 0
      ? `Rp ${Number(firstTicketPrice).toLocaleString("id-ID")}`
      : "Gratis";

  return (
    <Link href={`/events/${event.slug || event.id}`}>
      <Card className="flex flex-col overflow-hidden w-full text-sm rounded-lg hover:shadow-lg transition-shadow p-0">
        <div className="relative w-full aspect-[16/9]">
          <Image
            src={event.poster_image_url || "/banner.jpeg"}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Judul & Tanggal */}
        <CardHeader className="px-4">
          <CardTitle className="text-base truncate">{event.title}</CardTitle>
          <div className="flex flex-col text-sm text-gray-600">
            <span>
              {new Date(event.start_datetime).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="truncate">{event.city || event.venue_name}</span>
          </div>
        </CardHeader>
        <Separator />

        {/* Harga Tiket */}
        <CardContent className="px-4 pb-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-indigo-600">
                {priceLabel}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function EventCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden p-0 w-full">
      {/* Gambar landscape - sama seperti card asli */}
      <Skeleton className="w-full aspect-[16/9]" />

      <CardHeader className="p-3 pb-1 space-y-1">
        {/* Title - 2 baris */}
        <div className="space-y-1 min-h-[2.5rem]">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        {/* Location */}
        <Skeleton className="h-3 w-1/2 min-h-[1.25rem]" />
      </CardHeader>

      <CardContent className="p-3 pt-0 flex-grow">
        {/* Description - 2 baris */}
        <div className="space-y-1 min-h-[2.25rem]">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="flex justify-between items-center p-3">
        {/* Date */}
        <Skeleton className="h-3 w-24" />
        {/* Button */}
        <Skeleton className="h-6 w-16" />
      </CardFooter>
    </Card>
  );
}