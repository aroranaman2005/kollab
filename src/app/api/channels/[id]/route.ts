import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET /api/channels/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json(null, { status: 401 });

  const channel = await prisma.channel.findUnique({ where: { id: params.id } });
  if (!channel) return NextResponse.json(null, { status: 404 });

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: channel.workspaceId } },
  });
  if (!member) return NextResponse.json(null, { status: 403 });

  return NextResponse.json(channel);
}

// PATCH /api/channels/[id] - rename (admin only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const channel = await prisma.channel.findUnique({ where: { id: params.id } });
  if (!channel) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: channel.workspaceId } },
  });
  if (!member || member.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { name } = await req.json();
  const updated = await prisma.channel.update({
    where: { id: params.id },
    data: { name: name.replace(/\s+/g, "-").toLowerCase() },
  });
  return NextResponse.json(updated);
}

// DELETE /api/channels/[id] (admin only)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const channel = await prisma.channel.findUnique({ where: { id: params.id } });
  if (!channel) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: channel.workspaceId } },
  });
  if (!member || member.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  await prisma.channel.delete({ where: { id: params.id } });
  return NextResponse.json({ id: params.id });
}
