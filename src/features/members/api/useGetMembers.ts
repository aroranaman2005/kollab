import { useQuery } from "@tanstack/react-query";
import { MemberData } from "@/lib/types";

interface UseGetMembersProps { workspaceId: string; }

export const useGetMembers = ({ workspaceId }: UseGetMembersProps) => {
  const { data, isLoading } = useQuery<MemberData[]>({
    queryKey: ["members", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/members?workspaceId=${workspaceId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!workspaceId,
  });
  return { data: data ?? [], isLoading };
};
