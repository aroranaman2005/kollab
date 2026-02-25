import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET /api/workspaces/[id]/info - public info (name + whether current user is member)
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json(null, { status: 401 });

  const workspace = await prisma.workspace.findUnique({
    where: { id: params.id },
    select: { name: true },
  });

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: params.id } },
  });

  return NextResponse.json({ name: workspace?.name, isMember: !!member });
}
