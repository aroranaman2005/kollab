import { useQuery } from "@tanstack/react-query";
import { WorkspaceData } from "@/lib/types";

export const useGetWorkspaces = () => {
  const { data, isLoading } = useQuery<WorkspaceData[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await fetch("/api/workspaces");
      if (!res.ok) return [];
      return res.json();
    },
  });
  return { data: data ?? [], isLoading };
};
