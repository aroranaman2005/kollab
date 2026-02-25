import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = async () => {
  if (socket) return socket;

  await fetch("/api/socket/io");
  socket = io({
    path: "/api/socket/io",
    addTrailingSlash: false,
  });

  return socket;
};
