import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateMessageInput {
  body: string;
  image?: string;
  workspaceId: string;
  channelId?: string;
  conversationId?: string;
  parentMessageId?: string;
}

export const useCreateMessage = () => {
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, Error, CreateMessageInput>({
    mutationFn: async (data) => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["messages"] }); },
  });
};
