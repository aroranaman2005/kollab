import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET /api/members/current?workspaceId=xxx
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json(null, { status: 401 });

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json(null, { status: 400 });

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });

  return NextResponse.json(member);
}
