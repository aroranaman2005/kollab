import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET /api/workspaces/[id] - get workspace by id (must be a member)
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json(null, { status: 401 });

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: params.id } },
  });
  if (!member) return NextResponse.json(null, { status: 403 });

  const workspace = await prisma.workspace.findUnique({ where: { id: params.id } });
  return NextResponse.json(workspace);
}

// PATCH /api/workspaces/[id] - rename workspace (admin only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: params.id } },
  });
  if (!member || member.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { name } = await req.json();
  const workspace = await prisma.workspace.update({
    where: { id: params.id },
    data: { name },
  });
  return NextResponse.json(workspace);
}

// DELETE /api/workspaces/[id] - delete workspace (admin only)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: params.id } },
  });
  if (!member || member.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  // Cascade deletes handle members/channels/messages via Prisma schema
  await prisma.workspace.delete({ where: { id: params.id } });
  return NextResponse.json({ id: params.id });
}
