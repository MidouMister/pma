import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Find the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token, status: "PENDING" },
      include: { unit: true, company: true },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 400 }
      )
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      )
    }

    // Get the user from DB
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user with company and unit
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        companyId: invitation.companyId,
        unitId: invitation.unitId,
        role: invitation.role,
      },
    })

    // If role is ADMIN, update the unit's adminId
    if (invitation.role === "ADMIN") {
      await prisma.unit.update({
        where: { id: invitation.unitId },
        data: { adminId: updatedUser.id },
      })
    }

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    })

    return NextResponse.json({
      unitId: invitation.unitId,
      companyId: invitation.companyId,
      role: invitation.role,
    })
  } catch (error) {
    console.error("Accept invitation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
