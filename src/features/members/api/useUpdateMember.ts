import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, Error, { id: string; role: "admin" | "member" }>({
    mutationFn: async ({ id, role }) => {
      const res = await fetch(`/api/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (_, { id }) => { queryClient.invalidateQueries({ queryKey: ["member", id] }); },
  });
};
