import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// POST /api/reactions - toggle a reaction on a message
// body: { messageId, value }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId, value } = await req.json();

  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });

  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: { userId: session.user.id, workspaceId: message.workspaceId },
    },
  });
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  // Toggle: remove if exists, add if not
  const existing = await prisma.reaction.findFirst({
    where: { messageId, memberId: member.id, value },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ toggled: "removed" });
  } else {
    const reaction = await prisma.reaction.create({
      data: { value, messageId, memberId: member.id, workspaceId: message.workspaceId },
    });
    return NextResponse.json(reaction, { status: 201 });
  }
}
