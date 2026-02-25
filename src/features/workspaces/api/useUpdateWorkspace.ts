import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkspaceData } from "@/lib/types";

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation<WorkspaceData, Error, { id: string; name: string }>({
    mutationFn: async ({ id, name }) => {
      const res = await fetch(`/api/workspaces/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["workspace", id] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};
