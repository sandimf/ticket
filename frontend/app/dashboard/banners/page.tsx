import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import getQueryClient from "@/lib/query/getQueryClient";
import { queryKeys } from "@/lib/query/keys";
import { getBannersServer } from "@/lib/api/banner-api";
import AdminBannersClient from "./_client";

export default async function AdminBannersPage() {
  const queryClient = getQueryClient();

  await queryClient.fetchQuery({
    queryKey: queryKeys.banners.all,
    queryFn: getBannersServer,
    staleTime: 10 * 1000, 
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <AdminBannersClient />
    </HydrationBoundary>
  );
}