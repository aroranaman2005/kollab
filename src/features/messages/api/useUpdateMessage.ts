import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateMessage = () => {
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, Error, { id: string; body: string }>({
    mutationFn: async ({ id, body }) => {
      const res = await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["message", id] });
    },
  });
};
