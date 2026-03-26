import { ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserGroupIcon,
  CreditCardIcon,
  Settings01Icon,
  FolderIcon,
  KanbanIcon,
  UserCircleIcon,
  HomeIcon,
  BarChartIcon,
  LayersIcon,
} from "@hugeicons/core-free-icons"

export type NavRole = "OWNER" | "ADMIN" | "USER"

export interface NavItem {
  title: string
  url: string
  icon?: ReactNode
  items?: NavItem[]
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

// Helper to generate role-based navigation items
export function getNavItems(
  role: NavRole | null,
  companyId?: string | null,
  unitId?: string | null
): NavGroup[] {
  const unitUrl = unitId ? `/unite/${unitId}` : ""

  // OWNER navigation - full company access
  if (role === "OWNER" && companyId) {
    return [
      {
        title: "Entreprise",
        items: [
          {
            title: "Dashboard",
            url: `/company/${companyId}`,
            icon: <HugeiconsIcon icon={HomeIcon} strokeWidth={2} />,
          },
          {
            title: "Unités",
            url: `/company/${companyId}/units`,
            icon: <HugeiconsIcon icon={LayersIcon} strokeWidth={2} />,
          },
          {
            title: "Équipe",
            url: `/company/${companyId}/team`,
            icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />,
          },
          {
            title: "Abonnement",
            url: `/company/${companyId}/billing`,
            icon: <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} />,
          },
        ],
      },
      {
        title: "Unité",
        items: unitUrl
          ? [
              {
                title: "Dashboard",
                url: unitUrl,
                icon: <HugeiconsIcon icon={BarChartIcon} strokeWidth={2} />,
              },
              {
                title: "Projets",
                url: `${unitUrl}/projects`,
                icon: <HugeiconsIcon icon={FolderIcon} strokeWidth={2} />,
              },
              {
                title: "Kanban",
                url: `${unitUrl}/kanban`,
                icon: <HugeiconsIcon icon={KanbanIcon} strokeWidth={2} />,
              },
              {
                title: "Clients",
                url: `${unitUrl}/clients`,
                icon: <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />,
              },
              {
                title: "Membres",
                url: `${unitUrl}/members`,
                icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />,
              },
              {
                title: "Paramètres",
                url: `${unitUrl}/settings`,
                icon: <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />,
              },
            ]
          : [],
      },
    ]
  }

  // ADMIN navigation - unit access
  if (role === "ADMIN" && unitId) {
    return [
      {
        title: "Unité",
        items: [
          {
            title: "Dashboard",
            url: `/unite/${unitId}`,
            icon: <HugeiconsIcon icon={BarChartIcon} strokeWidth={2} />,
          },
          {
            title: "Projets",
            url: `/unite/${unitId}/projects`,
            icon: <HugeiconsIcon icon={FolderIcon} strokeWidth={2} />,
          },
          {
            title: "Kanban",
            url: `/unite/${unitId}/kanban`,
            icon: <HugeiconsIcon icon={KanbanIcon} strokeWidth={2} />,
          },
          {
            title: "Clients",
            url: `/unite/${unitId}/clients`,
            icon: <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />,
          },
          {
            title: "Membres",
            url: `/unite/${unitId}/members`,
            icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />,
          },
          {
            title: "Paramètres",
            url: `/unite/${unitId}/settings`,
            icon: <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />,
          },
        ],
      },
    ]
  }

  // USER navigation - limited access
  if (role === "USER" && unitId) {
    return [
      {
        title: "Espace de travail",
        items: [
          {
            title: "Dashboard",
            url: `/unite/${unitId}`,
            icon: <HugeiconsIcon icon={BarChartIcon} strokeWidth={2} />,
          },
          {
            title: "Projets",
            url: `/unite/${unitId}/projects`,
            icon: <HugeiconsIcon icon={FolderIcon} strokeWidth={2} />,
          },
          {
            title: "Kanban",
            url: `/unite/${unitId}/kanban`,
            icon: <HugeiconsIcon icon={KanbanIcon} strokeWidth={2} />,
          },
        ],
      },
    ]
  }

  // Default/fallback - minimal navigation
  return [
    {
      title: "Dashboard",
      items: [
        {
          title: "Accueil",
          url: "/dashboard",
          icon: <HugeiconsIcon icon={HomeIcon} strokeWidth={2} />,
        },
      ],
    },
  ]
}

// Notification URL based on role
export function getNotificationsUrl(
  role: NavRole | null,
  companyId?: string | null
): string {
  if (role === "OWNER" && companyId) {
    return `/company/${companyId}/notifications`
  }
  return "/dashboard/notifications"
}
