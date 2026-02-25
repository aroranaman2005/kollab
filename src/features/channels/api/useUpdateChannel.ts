import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChannelData } from "@/lib/types";

export const useUpdateChannel = () => {
  const queryClient = useQueryClient();
  return useMutation<ChannelData, Error, { id: string; name: string }>({
    mutationFn: async ({ id, name }) => {
      const res = await fetch(`/api/channels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["channel", data.id] });
      queryClient.invalidateQueries({ queryKey: ["channels", data.workspaceId] });
    },
  });
};
