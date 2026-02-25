import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

function generateJoinCode() {
  return Array.from(
    { length: 6 },
    () => "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]
  ).join("");
}

// POST /api/workspaces/[id]/join-code - regenerate join code (admin only)
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: params.id } },
  });
  if (!member || member.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  let joinCode = generateJoinCode();
  while (await prisma.workspace.findUnique({ where: { joinCode } })) {
    joinCode = generateJoinCode();
  }

  const workspace = await prisma.workspace.update({
    where: { id: params.id },
    data: { joinCode },
  });

  return NextResponse.json(workspace);
}
