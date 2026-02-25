// Shared application types — replaces Convex's generated Id<"table"> types.
// All IDs are plain strings (cuid) from MySQL via Prisma.

export interface UserData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface WorkspaceData {
  id: string;
  name: string;
  joinCode: string;
  userId: string;
}

export interface MemberData {
  id: string;
  userId: string;
  workspaceId: string;
  role: "admin" | "member";
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface ChannelData {
  id: string;
  name: string;
  workspaceId: string;
  createdAt: Date;
}

export interface ConversationData {
  id: string;
  workspaceId: string;
  memberOneId: string;
  memberTwoId: string;
}

export interface ReactionData {
  id: string;
  value: string;
  messageId: string;
  memberId: string;
  workspaceId: string;
  count: number;
  memberIds: string[];
}

export interface ThreadData {
  count: number;
  image: string | undefined;
  timeStamp: number;
  name: string | undefined;
}

export interface MessageData {
  id: string;
  body: string;
  image: string | null | undefined;
  memberId: string;
  workspaceId: string;
  channelId: string | null | undefined;
  conversationId: string | null | undefined;
  parentMessageId: string | null | undefined;
  updatedAt: Date | null;
  createdAt: Date;
  member: MemberData;
  user: UserData;
  reactions: ReactionData[];
  threadCount: number;
  threadImage: string | undefined;
  threadTimestamp: number;
  threadName: string | undefined;
  isAuthor: boolean;
}
