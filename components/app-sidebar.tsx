"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { getNavItems, NavGroup } from "@/lib/nav"
import { usePathname } from "next/navigation"

export interface AppSidebarProps {
  user: {
    name: string
    email: string
    avatar: string
  }
  role: string | null
  companyId: string | null
  unitId: string | null
  subscription?: {
    planName: string
    status: string
    daysRemaining: number
  }
}

// Sample teams for TeamSwitcher - will be replaced with real company/units data
const sampleTeams = [
  {
    name: "Mon Entreprise",
    logo: "🏢",
    plan: "Starter",
  },
]

export function AppSidebar({
  user: userProp,
  role,
  companyId,
  unitId,
  subscription,
}: AppSidebarProps) {
  const pathname = usePathname()
  const navGroups: NavGroup[] = getNavItems(
    role as "OWNER" | "ADMIN" | "USER",
    companyId,
    unitId
  )

  // Build items with icons for NavMain
  const navItemsWithIcons = navGroups.map((group) => {
    const activeItem = group.items.find((item) => pathname.startsWith(item.url))
    return {
      title: group.title,
      url: "#",
      icon: activeItem?.icon,
      isActive: !!activeItem,
      items: group.items,
    }
  })

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher teams={sampleTeams} />
      </SidebarHeader>
      <SidebarContent>
        {navItemsWithIcons.map((group) => (
          <NavMain key={group.title} items={[group]} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userProp} role={role} subscription={subscription} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
