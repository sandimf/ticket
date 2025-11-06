import { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import { headers, cookies } from "next/headers"
import { TicketSection } from "@/components/features/ticket/ticket-section"
import {
  CalendarDays,
  Info,
  MapPin,
  Tag,
  Ticket,
  AlignLeft,
} from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card" // Menambahkan komponen Card

async function getEvent(slug: string) {
  const headersList = await headers()
  const host = headersList.get("host") ?? "localhost:3000"
  const protocol = headersList.get("x-forwarded-proto") ?? "http"
  const baseUrl = `${protocol}://${host}`

  const res = await fetch(`${baseUrl}/api/events/${slug}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    return null
  }

  const data = await res.json()
  return data.data
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    return {
      title: "Event Not Found",
    }
  }

  return {
    title: event.title,
    description: event.description,
  }
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    notFound()
  }

  // Ambil user_id dari cookie untuk diteruskan ke TicketSection
  const cookieStore = await cookies()
  const userIdCookie = cookieStore.get("user_id")?.value
  const userId = userIdCookie ? Number(userIdCookie) : undefined

  return (
    <main className="bg-gray-50 dark:bg-gray-950 py-8 md:py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Kolom Kiri - Konten Utama */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gambar Poster */}
          {event.poster_image_url && (
            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden shadow-xl">
              <Image
                src={event.poster_image_url}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Judul Event */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            {event.title}
          </h1>

          {/* Tabs Konten */}
          <Tabs defaultValue="deskripsi" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="deskripsi">
                <AlignLeft className="w-4 h-4 mr-2" />
                Deskripsi
              </TabsTrigger>
              <TabsTrigger value="tiket">
                <Ticket className="w-4 h-4 mr-2" />
                Tiket
              </TabsTrigger>
              <TabsTrigger value="syarat">
                <Info className="w-4 h-4 mr-2" />
                Syarat & Ketentuan
              </TabsTrigger>
            </TabsList>

            {/* Deskripsi */}
            <TabsContent value="deskripsi" className="pt-6">
              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-xl font-semibold mb-2">
                  About This Event
                </h2>
                <p>{event.description}</p>
              </div>
            </TabsContent>

            {/* Tiket */}
            <TabsContent value="tiket" className="pt-6">
              <TicketSection
                eventId={event.id}
                ticketTypes={event.ticket_types || []}
                userId={userId}
              />
            </TabsContent>

            {/* Syarat & Ketentuan */}
            <TabsContent value="syarat" className="pt-6">
              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-xl font-semibold mb-2">
                  Syarat dan Ketentuan
                </h2>
                <p>{event.terms || "Belum ada syarat dan ketentuan."}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Kolom Kanan - Info Sticky */}
        
      </div>
    </main>
  )
}