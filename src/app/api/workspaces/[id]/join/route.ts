import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// POST /api/workspaces/[id]/join  body: { joinCode }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { joinCode } = await req.json();

  const workspace = await prisma.workspace.findUnique({ where: { id: params.id } });
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  if (workspace.joinCode !== joinCode.toLowerCase())
    return NextResponse.json({ error: "Invalid join code" }, { status: 400 });

  // Check if already a member
  const existing = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: params.id } },
  });
  if (existing) return NextResponse.json({ id: params.id });

  await prisma.member.create({
    data: { userId: session.user.id, workspaceId: params.id, role: "member" },
  });

  return NextResponse.json({ id: params.id });
}
