import { useInfiniteQuery } from "@tanstack/react-query";
import { MessageData } from "@/lib/types";

const BATCH_SIZE = 20;

interface UseGetMessagesProps {
  channelId?: string;
  conversationId?: string;
  parentMessageId?: string;
}

interface MessagesPage {
  results: MessageData[];
  nextCursor: string | null;
  isDone: boolean;
}

export const useGetMessages = ({ channelId, conversationId, parentMessageId }: UseGetMessagesProps) => {
  const queryKey = ["messages", { channelId, conversationId, parentMessageId }];

  const { data, fetchNextPage, isFetchingNextPage, isPending } = useInfiniteQuery<MessagesPage>({
    queryKey,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(BATCH_SIZE) });
      if (channelId) params.set("channelId", channelId);
      if (conversationId) params.set("conversationId", conversationId);
      if (parentMessageId) params.set("parentMessageId", parentMessageId);
      if (pageParam) params.set("cursor", pageParam as string);

      const res = await fetch(`/api/messages?${params}`);
      if (!res.ok) return { results: [], nextCursor: null, isDone: true };
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
  });

  const results = data?.pages.flatMap((p) => p.results) ?? [];
  const isDone = data?.pages.at(-1)?.isDone ?? true;
  const loadMore = () => fetchNextPage();

  return {
    results,
    status: isDone ? "Exhausted" : isFetchingNextPage ? "LoadingMore" : "CanLoadMore",
    isLoading: isPending,
    loadMore,
  } as const;
};
