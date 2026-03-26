// =====================================================
// PMA Permissions - RBAC helper functions
// =====================================================

import type { Role } from "./types"

/**
 * Check if user can view all units (OWNER only)
 */
export function canViewAllUnits(role: Role | null): boolean {
  return role === "OWNER"
}

/**
 * Check if user can manage company settings (OWNER only)
 */
export function canManageCompanySettings(role: Role | null): boolean {
  return role === "OWNER"
}

/**
 * Check if user can manage billing/subscription (OWNER only)
 */
export function canManageBilling(role: Role | null): boolean {
  return role === "OWNER"
}

/**
 * Check if user can create/delete units (OWNER only)
 */
export function canManageUnits(role: Role | null): boolean {
  return role === "OWNER"
}

/**
 * Check if user can invite/remove members
 * - OWNER: can invite to any unit
 * - ADMIN: can invite to own unit only
 * - USER: cannot invite
 */
export function canManageMembers(role: Role | null): boolean {
  return role === "OWNER" || role === "ADMIN"
}

/**
 * Check if user can create/edit projects
 * - OWNER: can create in any unit
 * - ADMIN: can create in own unit
 * - USER: cannot create
 */
export function canManageProjects(role: Role | null): boolean {
  return role === "OWNER" || role === "ADMIN"
}

/**
 * Check if user can view projects
 * - OWNER: all projects company-wide
 * - ADMIN: projects in own unit
 * - USER: only assigned projects (handled separately)
 */
export function canViewAllProjects(role: Role | null): boolean {
  return role === "OWNER" || role === "ADMIN"
}

/**
 * Check if user can manage phases & Gantt
 */
export function canManagePhases(role: Role | null): boolean {
  return role === "OWNER" || role === "ADMIN"
}

/**
 * Check if user can record production
 */
export function canRecordProduction(role: Role | null): boolean {
  return role === "OWNER" || role === "ADMIN"
}

/**
 * Check if user can manage clients
 * - OWNER/ADMIN: full CRUD
 * - USER: view only (handled in query)
 */
export function canManageClients(role: Role | null): boolean {
  return role === "OWNER" || role === "ADMIN"
}

/**
 * Check if user can create/manage lanes (Kanban)
 */
export function canManageLanes(role: Role | null): boolean {
  return role === "OWNER" || role === "ADMIN"
}

/**
 * Check if user can create tasks
 */
export function canCreateTasks(role: Role | null): boolean {
  return role === "OWNER" || role === "ADMIN"
}

/**
 * Check if user can drag any task
 * - OWNER/ADMIN: can drag any task
 * - USER: can only drag their own tasks
 */
export function canDragAnyTask(role: Role | null): boolean {
  return role === "OWNER" || role === "ADMIN"
}

/**
 * Check if user can mark any task complete
 * - OWNER/ADMIN: can mark any task complete
 * - USER: can only mark their own tasks
 */
export function canMarkAnyTaskComplete(role: Role | null): boolean {
  return role === "OWNER" || role === "ADMIN"
}

/**
 * Check if user can log time entries
 * - OWNER: any project in company
 * - ADMIN: any project in unit
 * - USER: only assigned projects
 */
export function canLogTime(role: Role | null): boolean {
  return role !== null
}

/**
 * Check if user can edit/delete others' time entries
 * - OWNER/ADMIN: can edit any in their scope
 * - USER: can only edit own
 */
export function canManageOthersTimeEntries(role: Role | null): boolean {
  return role === "OWNER" || role === "ADMIN"
}

/**
 * Check if user can view activity logs
 * - OWNER: all logs company-wide
 * - ADMIN: logs for own unit
 * - USER: logs for assigned projects only
 */
export function canViewActivityLogs(role: Role | null): boolean {
  return role !== null
}

/**
 * Get role display label
 */
export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    OWNER: "Propriétaire",
    ADMIN: "Administrateur",
    USER: "Membre",
  }
  return labels[role] || role
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: Role): string {
  const colors: Record<Role, string> = {
    OWNER: "bg-purple-500",
    ADMIN: "bg-blue-500",
    USER: "bg-gray-500",
  }
  return colors[role] || "bg-gray-500"
}

/**
 * Check if user has admin-level access (can manage unit operations)
 */
export function isAdminOrAbove(role: Role | null): boolean {
  return role === "OWNER" || role === "ADMIN"
}

/**
 * Check if user is the company owner
 */
export function isOwner(role: Role | null): boolean {
  return role === "OWNER"
}

/**
 * Check if user is an admin (unit-level)
 */
export function isAdmin(role: Role | null): boolean {
  return role === "ADMIN"
}

/**
 * Check if user is a regular user (project-scoped)
 */
export function isUser(role: Role | null): boolean {
  return role === "USER"
}

/**
 * Validate that user belongs to the correct scope for an action
 * Returns true if the action is allowed
 */
export function validateScope({
  userRole,
  userCompanyId,
  userUnitId,
  targetCompanyId,
  targetUnitId,
}: {
  userRole: Role | null
  userCompanyId: string | null
  userUnitId: string | null
  targetCompanyId: string
  targetUnitId?: string
}): boolean {
  // OWNER: company-wide access
  if (userRole === "OWNER") {
    return userCompanyId === targetCompanyId
  }

  // ADMIN: unit-scoped access
  if (userRole === "ADMIN") {
    return userCompanyId === targetCompanyId && userUnitId === targetUnitId
  }

  // USER: handled separately for project-specific access
  return false
}
