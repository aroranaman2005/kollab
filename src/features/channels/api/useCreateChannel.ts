import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChannelData } from "@/lib/types";

export const useCreateChannel = () => {
  const queryClient = useQueryClient();
  return useMutation<ChannelData, Error, { name: string; workspaceId: string }>({
    mutationFn: async (data) => {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["channels", workspaceId] });
    },
  });
};
