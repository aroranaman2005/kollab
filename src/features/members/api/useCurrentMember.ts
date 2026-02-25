import { useQuery } from "@tanstack/react-query";
import { MemberData } from "@/lib/types";

interface UseCurrentMemberProps { workspaceId: string; }

export const useCurrentMember = ({ workspaceId }: UseCurrentMemberProps) => {
  const { data, isLoading } = useQuery<MemberData | null>({
    queryKey: ["currentMember", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/members/current?workspaceId=${workspaceId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!workspaceId,
  });
  return { data: data ?? null, isLoading };
};
