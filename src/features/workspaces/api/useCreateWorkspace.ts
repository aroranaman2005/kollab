import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkspaceData } from "@/lib/types";

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation<WorkspaceData, Error, { name: string }>({
    mutationFn: async ({ name }) => {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["workspaces"] }); },
  });
};
