import { useQuery } from "@tanstack/react-query";
import { MessageData } from "@/lib/types";

interface UseGetMessageProps { id: string; }

export const useGetMessage = ({ id }: UseGetMessageProps) => {
  const { data, isLoading } = useQuery<MessageData | null>({
    queryKey: ["message", id],
    queryFn: async () => {
      const res = await fetch(`/api/messages/${id}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!id,
  });
  return { data: data ?? null, isLoading };
};
