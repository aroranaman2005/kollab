import { useQuery } from "@tanstack/react-query";
import { ChannelData } from "@/lib/types";

interface UseGetChannelProps { id: string; }

export const useGetChannel = ({ id }: UseGetChannelProps) => {
  const { data, isLoading } = useQuery<ChannelData | null>({
    queryKey: ["channel", id],
    queryFn: async () => {
      const res = await fetch(`/api/channels/${id}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!id,
  });
  return { data: data ?? null, isLoading };
};
