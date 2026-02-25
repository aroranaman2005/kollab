import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const BATCH_SIZE = 20;

// GET /api/messages?channelId=&conversationId=&parentMessageId=&cursor=&limit=
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ results: [], isDone: true }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const channelId = searchParams.get("channelId") ?? undefined;
  const conversationId = searchParams.get("conversationId") ?? undefined;
  const parentMessageId = searchParams.get("parentMessageId") ?? undefined;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? BATCH_SIZE);

  // Determine conversationId from parentMessage if needed
  let resolvedConversationId = conversationId;
  if (!conversationId && !channelId && parentMessageId) {
    const parent = await prisma.message.findUnique({ where: { id: parentMessageId } });
    resolvedConversationId = parent?.conversationId ?? undefined;
  }

  const messages = await prisma.message.findMany({
    where: {
      channelId: channelId ?? null,
      conversationId: resolvedConversationId ?? null,
      parentMessageId: parentMessageId ?? null,
    },
    include: {
      member: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
      reactions: true,
      replies: {
        include: {
          member: {
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = messages.length > limit;
  const page = hasMore ? messages.slice(0, limit) : messages;
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  // Build enriched message objects
  const enriched = page.map((msg) => {
    const reactionCounts = msg.reactions.reduce(
      (acc, r) => {
        acc[r.value] = (acc[r.value] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const reactionsWithCounts = Object.entries(reactionCounts).map(([value, count]) => ({
      value,
      count,
      memberIds: msg.reactions.filter((r) => r.value === value).map((r) => r.memberId),
    }));

    const lastReply = msg.replies.at(-1);
    const threadData = {
      threadCount: msg.replies.length,
      threadImage: lastReply?.member?.user?.image ?? undefined,
      threadTimestamp: lastReply ? new Date(lastReply.createdAt).getTime() : 0,
      threadName: lastReply?.member?.user?.name ?? undefined,
    };

    return {
      id: msg.id,
      body: msg.body,
      image: msg.image,
      memberId: msg.memberId,
      workspaceId: msg.workspaceId,
      channelId: msg.channelId,
      conversationId: msg.conversationId,
      parentMessageId: msg.parentMessageId,
      updatedAt: msg.updatedAt,
      createdAt: msg.createdAt,
      member: msg.member,
      user: msg.member.user,
      reactions: reactionsWithCounts,
      isAuthor: msg.member.userId === session.user.id,
      ...threadData,
    };
  });

  return NextResponse.json({ results: enriched, nextCursor, isDone: !hasMore });
}

// POST /api/messages - create a message
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { body: text, image, workspaceId, channelId, conversationId, parentMessageId } = body;

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const message = await prisma.message.create({
    data: {
      body: text,
      image: image ?? null,
      memberId: member.id,
      workspaceId,
      channelId: channelId ?? null,
      conversationId: conversationId ?? null,
      parentMessageId: parentMessageId ?? null,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
