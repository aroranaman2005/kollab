import { Server as IOServer } from "socket.io";

declare global {
  // eslint-disable-next-line no-var
  var io: IOServer | undefined;
}

export const emitMessagesChanged = (payload: {
  workspaceId: string;
  channelId?: string | null;
  conversationId?: string | null;
  parentMessageId?: string | null;
}) => {
  globalThis.io?.emit("messages:changed", payload);
};

