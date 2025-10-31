import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { headers } from "next/headers";
import { cookies } from "next/headers";
import { TicketSection } from "@/components/features/ticket/ticket-section";
import { Calendar1Icon, Info, LocateIcon, Tag, Text, Ticket } from "lucide-react";
import { IconLocation, IconLocationPin } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
async function getEvent(slug: string) {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/events/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.data;
}

async function getUserId() {
  const cookieStore = await cookies();
  const userDataCookie = cookieStore.get("user_data");

  if (!userDataCookie?.value) {
    return undefined;
  }

  try {
    const userData = JSON.parse(userDataCookie.value);
    return userData.id;
  } catch (error) {
    console.error("Error parsing user data cookie:", error);
    return undefined;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: event.title,
    description: event.description,
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEvent(slug);
  const userId = await getUserId();

  if (!event) {
    notFound();
  }

  return (
    <main className="w-full">
      <section className="relative overflow-hidden">
        <div className="relative container mx-auto px-4">
          <div className="grid gap-6 items-start">

            {/* Left side - Event info */}
            <div className="space-y-4 pt-8">
              {event.poster_image_url && (
                <div className="relative">
                  <div className="bg-white dark:bg-gray-900 rounded-sm shadow-2xl overflow-hidden">
                    <div className="relative w-full max-w-md mx-auto md:mx-0">
                      <div className="relative aspect-[16/9] w-full">
                        <Image
                          src={event.poster_image_url}
                          alt={event.title}
                          fill
                          className="object-cover rounded-sm shadow-2xl"
                          priority
                        />
                      </div>
                    </div>

                  </div>
                </div>
              )}
              <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
                {event.title}
              </h1>

              <div className="space-y-2 text-base">
                <div className="flex items-center gap-2">
                  <IconLocationPin size={18} />
                  <span>{event.venue_name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar1Icon size={18} />
                  <span>
                    {format(new Date(event.start_datetime), "dd MMMM")} - {format(new Date(event.end_datetime), "dd MMMM yyyy")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Tag size={18} />
                  <span>{event.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="deskripsi">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="deskripsi"><Text />Deskripsi</TabsTrigger>
              <TabsTrigger value="tiket"><Ticket />Tiket</TabsTrigger>
              <TabsTrigger value="syarat"><Info /> Syarat & Ketentuan</TabsTrigger>
            </TabsList>

            {/* Deskripsi */}
            <TabsContent value="deskripsi">
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md">
                  <p className="text-sm font-medium">Location</p>
                  <p>{event.venue_name}</p>
                  <p className="text-sm text-gray-500">
                    {event.address}, {event.city}
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md">
                  <p className="text-sm font-medium">Category</p>
                  <p>{event.category}</p>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-xl font-semibold mb-2">About This Event</h2>
                <p>{event.description}</p>
              </div>
            </TabsContent>

            {/* Tiket */}
            <TabsContent value="tiket">
              <TicketSection
                eventId={event.id}
                ticketTypes={event.ticket_types || []}
                userId={userId}
              />
            </TabsContent>
            <TabsContent value="syarat">
              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-xl font-semibold mb-2">Syarat dan Ketentuan</h2>
                <p>{event.terms || "Belum ada syarat dan ketentuan."}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  );
}