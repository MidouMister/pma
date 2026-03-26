import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Navbar } from "@/components/layout/Navbar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()

  if (!user) {
    redirect("/company/sign-in")
  }

  // Get user from DB to get role and companyId
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { role: true, companyId: true, unitId: true },
  })

  // If no company yet, redirect to onboarding
  if (!dbUser?.companyId) {
    redirect("/onboarding")
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        user={{
          name: user.fullName || user.username || "User",
          email: user.emailAddresses[0]?.emailAddress || "",
          avatar: user.imageUrl || "",
        }}
        role={dbUser?.role || "USER"}
        companyId={dbUser.companyId}
        unitId={dbUser.unitId}
      />
      <SidebarInset>
        <Navbar />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}