"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { getSocket } from "@/lib/socket-client";

export const SocketListener = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      const socket = await getSocket();
      if (!mounted) return;

      const onMessagesChanged = () => {
        queryClient.invalidateQueries({ queryKey: ["messages"] });
      };

      socket.on("messages:changed", onMessagesChanged);

      return () => {
        socket.off("messages:changed", onMessagesChanged);
      };
    };

    let cleanup: (() => void) | undefined;

    setup().then((fn) => {
      cleanup = fn;
    });

    return () => {
      mounted = false;
      cleanup?.();
    };
  }, [queryClient]);

  return null;
};
