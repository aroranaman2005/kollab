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

// GET /api/workspaces - list workspaces for current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json([], { status: 401 });

  const members = await prisma.member.findMany({
    where: { userId: session.user.id },
    include: { workspace: true },
  });

  const workspaces = members.map((m) => m.workspace);
  return NextResponse.json(workspaces);
}

// POST /api/workspaces - create a new workspace
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  // Ensure join code is unique
  let joinCode = generateJoinCode();
  while (await prisma.workspace.findUnique({ where: { joinCode } })) {
    joinCode = generateJoinCode();
  }

  const workspace = await prisma.workspace.create({
    data: {
      name,
      joinCode,
      userId: session.user.id,
      members: {
        create: { userId: session.user.id, role: "admin" },
      },
      channels: {
        create: { name: "general" },
      },
    },
  });

  return NextResponse.json(workspace, { status: 201 });
}
