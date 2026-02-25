import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET /api/members/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json(null, { status: 401 });

  const member = await prisma.member.findUnique({
    where: { id: params.id },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });
  if (!member) return NextResponse.json(null, { status: 404 });

  // Ensure requester is also a member of that workspace
  const requester = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: member.workspaceId } },
  });
  if (!requester) return NextResponse.json(null, { status: 403 });

  return NextResponse.json(member);
}

// PATCH /api/members/[id] - change role (admin only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const target = await prisma.member.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const requester = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: target.workspaceId } },
  });
  if (!requester || requester.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { role } = await req.json();
  const updated = await prisma.member.update({ where: { id: params.id }, data: { role } });
  return NextResponse.json(updated);
}

// DELETE /api/members/[id] - remove member (admin only, or self-leave)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const target = await prisma.member.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const requester = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: target.workspaceId } },
  });
  if (!requester) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  // Allow if admin OR if removing self (leave)
  const isSelf = target.userId === session.user.id;
  if (!isSelf && requester.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  await prisma.member.delete({ where: { id: params.id } });
  return NextResponse.json({ id: params.id });
}
