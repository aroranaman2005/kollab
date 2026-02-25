import { useQuery } from "@tanstack/react-query";

interface UseGetWorkspaceInfoProps { id: string; }

export const useGetWorkspaceInfo = ({ id }: UseGetWorkspaceInfoProps) => {
  const { data, isLoading } = useQuery<{ name: string; isMember: boolean } | null>({
    queryKey: ["workspaceInfo", id],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${id}/info`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!id,
  });
  return { data: data ?? null, isLoading };
};
