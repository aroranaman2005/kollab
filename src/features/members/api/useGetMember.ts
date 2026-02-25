import { useQuery } from "@tanstack/react-query";
import { MemberData } from "@/lib/types";

interface UseGetMemberProps { id: string; }

export const useGetMember = ({ id }: UseGetMemberProps) => {
  const { data, isLoading } = useQuery<MemberData | null>({
    queryKey: ["member", id],
    queryFn: async () => {
      const res = await fetch(`/api/members/${id}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!id,
  });
  return { data: data ?? null, isLoading };
};
