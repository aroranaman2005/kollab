import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ConversationData } from "@/lib/types";

interface CreateOrGetConversationInput {
  workspaceId: string;
  memberId: string;
}

export const useCreateOrGetConversation = () => {
  const queryClient = useQueryClient();
  return useMutation<ConversationData, Error, CreateOrGetConversationInput>({
    mutationFn: async ({ workspaceId, memberId }) => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, memberId }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["conversation", data.id] });
    },
  });
};
