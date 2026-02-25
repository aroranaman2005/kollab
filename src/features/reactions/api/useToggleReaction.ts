import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useToggleReaction = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { messageId: string; value: string }>({
    mutationFn: async ({ messageId, value }) => {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, value }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["messages"] }); },
  });
};
