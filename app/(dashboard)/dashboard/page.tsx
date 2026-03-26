import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/company/sign-in")
  }

  // Get user from DB to get role, companyId, unitId
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { role: true, companyId: true, unitId: true },
  })

  // Redirect based on role
  if (!dbUser?.companyId) {
    redirect("/onboarding")
  }

  if (dbUser.role === "OWNER" && dbUser.companyId) {
    redirect(`/company/${dbUser.companyId}`)
  }

  if (dbUser.role === "ADMIN" && dbUser.unitId) {
    redirect(`/unite/${dbUser.unitId}`)
  }

  // USER goes to their unit dashboard
  if (dbUser.unitId) {
    redirect(`/unite/${dbUser.unitId}`)
  }

  // Fallback
  redirect("/onboarding")
}