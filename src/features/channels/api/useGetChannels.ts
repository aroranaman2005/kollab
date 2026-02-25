import { useQuery } from "@tanstack/react-query";
import { ChannelData } from "@/lib/types";

interface UseGetChannelsProps { workspaceId: string; }

export const useGetChannels = ({ workspaceId }: UseGetChannelsProps) => {
  const { data, isLoading } = useQuery<ChannelData[]>({
    queryKey: ["channels", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/channels?workspaceId=${workspaceId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!workspaceId,
  });
  return { data: data ?? [], isLoading };
};
