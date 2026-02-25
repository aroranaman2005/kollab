import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET /api/messages/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json(null, { status: 401 });

  const message = await prisma.message.findUnique({
    where: { id: params.id },
    include: {
      member: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      reactions: true,
    },
  });
  if (!message) return NextResponse.json(null, { status: 404 });

  return NextResponse.json({ ...message, isAuthor: message.member.userId === session.user.id });
}

// PATCH /api/messages/[id] - edit body (author only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const message = await prisma.message.findUnique({
    where: { id: params.id },
    include: { member: true },
  });
  if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (message.member.userId !== session.user.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { body } = await req.json();
  const updated = await prisma.message.update({
    where: { id: params.id },
    data: { body, updatedAt: new Date() },
  });
  return NextResponse.json(updated);
}

// DELETE /api/messages/[id] (author only)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const message = await prisma.message.findUnique({
    where: { id: params.id },
    include: { member: true },
  });
  if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (message.member.userId !== session.user.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  await prisma.message.delete({ where: { id: params.id } });
  return NextResponse.json({ id: params.id });
}
