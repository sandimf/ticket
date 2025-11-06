import {
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import getQueryClient from "@/lib/query/getQueryClient";
import { queryKeys } from "@/lib/query/keys";
import { getEvents } from "@/lib/api/event-api";
import EventDiscoveryPage from "@/components/features/event/event-discorver";

export default async function EventsPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.events.all,
    queryFn: getEvents,
  });
  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <EventDiscoveryPage />
    </HydrationBoundary>
  );
}