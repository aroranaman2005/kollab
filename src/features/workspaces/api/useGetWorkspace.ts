import { useQuery } from "@tanstack/react-query";
import { WorkspaceData } from "@/lib/types";

interface UseGetWorkspaceProps { id: string; }

export const useGetWorkspace = ({ id }: UseGetWorkspaceProps) => {
  const { data, isLoading } = useQuery<WorkspaceData | null>({
    queryKey: ["workspace", id],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${id}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!id,
  });
  return { data: data ?? null, isLoading };
};
