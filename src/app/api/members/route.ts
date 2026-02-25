import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET /api/members?workspaceId=xxx
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json([], { status: 401 });

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json([], { status: 400 });

  const currentMember = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });
  if (!currentMember) return NextResponse.json([], { status: 403 });

  const members = await prisma.member.findMany({
    where: { workspaceId },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });
  return NextResponse.json(members);
}
