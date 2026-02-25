import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// POST /api/conversations - create or get a DM conversation
// body: { workspaceId, memberId }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceId, memberId } = await req.json();

  // Find current user's member record
  const currentMember = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });
  if (!currentMember) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  // Ensure target member exists in workspace
  const targetMember = await prisma.member.findUnique({
    where: { id: memberId },
  });
  if (!targetMember || targetMember.workspaceId !== workspaceId)
    return NextResponse.json({ error: "Member not found" }, { status: 404 });

  if (currentMember.id === targetMember.id)
    return NextResponse.json({ error: "Cannot DM yourself" }, { status: 400 });

  // Check if conversation already exists (in either direction)
  const existing = await prisma.conversation.findFirst({
    where: {
      workspaceId,
      OR: [
        { memberOneId: currentMember.id, memberTwoId: targetMember.id },
        { memberOneId: targetMember.id, memberTwoId: currentMember.id },
      ],
    },
  });

  if (existing) return NextResponse.json(existing);

  const conversation = await prisma.conversation.create({
    data: { workspaceId, memberOneId: currentMember.id, memberTwoId: targetMember.id },
  });

  return NextResponse.json(conversation, { status: 201 });
}
