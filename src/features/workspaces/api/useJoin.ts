import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useJoin = () => {
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, Error, { workspaceId: string; joinCode: string }>({
    mutationFn: async ({ workspaceId, joinCode }) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["workspaces"] }); },
  });
};
