import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { getEvents } from "@/lib/api/event-api"; 

export const useGetEvents = () => {
  return useQuery({
    queryKey: queryKeys.events.all,
    queryFn: getEvents, 
  });
};