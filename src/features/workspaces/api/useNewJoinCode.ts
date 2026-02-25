import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkspaceData } from "@/lib/types";

export const useNewJoinCode = () => {
  const queryClient = useQueryClient();
  return useMutation<WorkspaceData, Error, { workspaceId: string }>({
    mutationFn: async ({ workspaceId }) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/join-code`, { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
    },
  });
};
