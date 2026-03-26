// =====================================================
// PMA Cache - Cache tags constants
// =====================================================

/**
 * Cache tags for revalidation
 * All mutations must call revalidateTag() with the appropriate tags
 */
export const CacheTags = {
  // Company & Subscription
  company: "company",
  subscription: "subscription",
  plans: "plans",

  // Units
  units: "units",
  unit: (unitId: string) => `unit:${unitId}`,

  // Projects & Phases
  projects: "projects",
  project: (projectId: string) => `project:${projectId}`,
  phases: "phases",
  phase: (phaseId: string) => `phase:${phaseId}`,
  subPhases: "subPhases",
  subPhase: (subPhaseId: string) => `subPhase:${subPhaseId}`,

  // Clients
  clients: "clients",
  client: (clientId: string) => `client:${clientId}`,

  // Team
  team: "team",
  invitations: "invitations",
  invitation: (invitationId: string) => `invitation:${invitationId}`,
  members: "members",
  member: (userId: string) => `member:${userId}`,

  // Kanban
  lanes: "lanes",
  lane: (laneId: string) => `lane:${laneId}`,
  tasks: "tasks",
  task: (taskId: string) => `task:${taskId}`,
  tags: "tags",
  tag: (tagId: string) => `tag:${tagId}`,

  // Production
  productions: "productions",
  production: (productionId: string) => `production:${productionId}`,
  products: "products",
  product: (productId: string) => `product:${productId}`,

  // Time Tracking
  timeEntries: "timeEntries",
  timeEntry: (timeEntryId: string) => `timeEntry:${timeEntryId}`,

  // Comments & Mentions
  comments: "comments",
  comment: (commentId: string) => `comment:${commentId}`,
  mentions: "mentions",
  mention: (mentionId: string) => `mention:${mentionId}`,

  // Activity Logs
  activityLogs: "activityLogs",
  activityLog: (logId: string) => `activityLog:${logId}`,

  // Notifications
  notifications: "notifications",
  notification: (notificationId: string) => `notification:${notificationId}`,
} as const

/**
 * Helper to check if data should be cached or fresh
 * These should always use unstable_noStore()
 */
export const FRESH_DATA_TYPES = [
  "notifications",
  "comments",
  "activityLogs",
  "unreadCount",
] as const

export type FreshDataType = (typeof FRESH_DATA_TYPES)[number]

/**
 * Check if a cache tag is for fresh data (should use unstable_noStore)
 */
export function isFreshDataTag(tag: string): boolean {
  return FRESH_DATA_TYPES.some((type) => tag.includes(type))
}
