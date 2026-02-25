import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET /api/channels?workspaceId=xxx
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json([], { status: 401 });

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json([], { status: 400 });

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });
  if (!member) return NextResponse.json([], { status: 403 });

  const channels = await prisma.channel.findMany({ where: { workspaceId } });
  return NextResponse.json(channels);
}

// POST /api/channels - create channel (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, workspaceId } = await req.json();

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });
  if (!member || member.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const parsedName = name.replace(/\s+/g, "-").toLowerCase();
  const channel = await prisma.channel.create({ data: { name: parsedName, workspaceId } });
  return NextResponse.json(channel, { status: 201 });
}
