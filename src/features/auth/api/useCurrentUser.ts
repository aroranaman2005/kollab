import { useQuery } from "@tanstack/react-query";
import { UserData } from "@/lib/types";

export const useCurrentUser = () => {
  const { data, isLoading } = useQuery<UserData | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await fetch("/api/users/current");
      if (!res.ok) return null;
      return res.json();
    },
  });
  return { data: data ?? null, isLoading };
};
