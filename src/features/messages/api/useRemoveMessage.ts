import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRemoveMessage = () => {
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["messages"] }); },
  });
};
