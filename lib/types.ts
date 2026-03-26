// =====================================================
// PMA Types - All TypeScript interfaces and enums
// =====================================================

// ---------------------------------------------------
// Enums (matching Prisma schema)
// ---------------------------------------------------

/**
 * User roles in the system
 * - OWNER: Company-wide, created at onboarding
 * - ADMIN: Unit-scoped, manages a single Unit
 * - USER: Project-scoped, access only to assigned projects
 */
export type Role = "OWNER" | "ADMIN" | "USER"

/**
 * Project status lifecycle
 */
export type ProjectStatus = "New" | "InProgress" | "Pause" | "Complete"

/**
 * Phase status lifecycle
 */
export type PhaseStatus = "New" | "InProgress" | "Pause" | "Complete"

/**
 * SubPhase status lifecycle
 */
export type SubPhaseStatus = "New" | "InProgress" | "Pause" | "Complete"

/**
 * Invitation status
 */
export type InvitationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED"

/**
 * Notification types by trigger
 */
export type NotificationType =
  | "INVITATION"
  | "PROJECT"
  | "TASK"
  | "TEAM"
  | "PHASE"
  | "CLIENT"
  | "PRODUCTION"
  | "LANE"
  | "TAG"
  | "GENERAL"

/**
 * Subscription status lifecycle
 */
export type SubscriptionStatus =
  | "TRIAL"
  | "ACTIVE"
  | "GRACE"
  | "READONLY"
  | "SUSPENDED"

// ---------------------------------------------------
// Legal Forms (Algerian)
// ---------------------------------------------------

export const LEGAL_FORMS = [
  "SARL",
  "EURL",
  "SPA",
  "EIRL",
  "SNC",
  "Autre",
] as const

export type LegalForm = (typeof LEGAL_FORMS)[number]

// ---------------------------------------------------
// Sectors
// ---------------------------------------------------

export const SECTORS = [
  "Construction",
  "Engineering",
  "PublicWorks",
  "Industry",
  "Autre",
] as const

export type Sector = (typeof SECTORS)[number]

// ---------------------------------------------------
// Wilayas of Algeria (48)
// ---------------------------------------------------

export const WILAYAS = [
  "Adrar",
  "Ain Defla",
  "Ain Temouchent",
  "Alger",
  "Annaba",
  "Batna",
  "Bechar",
  "Bejaia",
  "Biskra",
  "Blida",
  "Bordj Bou Arreridj",
  "Bouira",
  "Boumerdes",
  "Chlef",
  "Constantine",
  "Djelfa",
  "El Bayadh",
  "El Oued",
  "El Tarf",
  "Ghardaia",
  "Guelma",
  "Illizi",
  "Jijel",
  "Khenchela",
  "Laghouat",
  "Lemdi",
  "Libya",
  "Mascara",
  "Medea",
  "Mila",
  "Mostaganem",
  "M'Sila",
  "Naama",
  "Oran",
  "Ouargla",
  "Ouled Djellal",
  "Relizane",
  "Saida",
  "Setif",
  "Sidi Bel Abbes",
  "Skikda",
  "Souk Ahras",
  "Tamanrasset",
  "Tebessa",
  "Tiaret",
  "Tindouf",
  "Tipaza",
  "Tissemsilt",
  "Tizi Ouzou",
  "Tlemcen",
] as const

export type Wilaya = (typeof WILAYAS)[number]

// ---------------------------------------------------
// Plan Tiers
// ---------------------------------------------------

export interface Plan {
  id: string
  name: string
  maxUnits: number | null // null = unlimited
  maxProjects: number | null
  maxTasksPerProject: number | null
  maxMembers: number | null
  priceDA: number
}

// ---------------------------------------------------
// User (matches User model)
// ---------------------------------------------------

export interface User {
  id: string
  clerkId: string
  name: string
  email: string
  role: Role
  companyId: string | null
  unitId: string | null
  createdAt: Date
  updatedAt: Date
}

// ---------------------------------------------------
// Company
// ---------------------------------------------------

export interface Company {
  id: string
  name: string
  ownerId: string
  logo: string | null
  NIF: string
  RC: string
  NIS: string
  AI: string
  formJur: LegalForm
  sector: Sector
  wilaya: Wilaya
  address: string
  phone: string
  email: string
  productionAlertThreshold: number // default 80
  createdAt: Date
  updatedAt: Date
}

// ---------------------------------------------------
// Unit
// ---------------------------------------------------

export interface Unit {
  id: string
  companyId: string
  adminId: string | null
  name: string
  address: string | null
  phone: string | null
  email: string | null
  logo: string | null
  createdAt: Date
  updatedAt: Date
}

// ---------------------------------------------------
// Subscription
// ---------------------------------------------------

export interface Subscription {
  id: string
  companyId: string
  planId: string
  status: SubscriptionStatus
  startAt: Date
  endAt: Date
  createdAt: Date
  updatedAt: Date
}

// ---------------------------------------------------
// Invitation
// ---------------------------------------------------

export interface Invitation {
  id: string
  companyId: string
  unitId: string
  email: string
  role: Role
  token: string
  status: InvitationStatus
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

// ---------------------------------------------------
// Client
// ---------------------------------------------------

export interface Client {
  id: string
  unitId: string
  companyId: string
  name: string
  wilaya: Wilaya | null
  phone: string | null
  email: string | null
  createdAt: Date
  updatedAt: Date
}

// ---------------------------------------------------
// Project
// ---------------------------------------------------

export interface Project {
  id: string
  unitId: string
  companyId: string
  clientId: string | null
  name: string
  code: string
  type: string | null
  montantHT: number
  montantTTC: number
  ods: Date
  delaiMonths: number
  delaiDays: number
  status: ProjectStatus
  signe: boolean
  progress: number
  createdAt: Date
  updatedAt: Date
}

// ---------------------------------------------------
// Team
// ---------------------------------------------------

export interface Team {
  id: string
  projectId: string
  createdAt: Date
  updatedAt: Date
}

export interface TeamMember {
  id: string
  teamId: string
  userId: string
  roleLabel: string | null
  createdAt: Date
  updatedAt: Date
}

// ---------------------------------------------------
// Phase & Gantt
// ---------------------------------------------------

export interface Phase {
  id: string
  projectId: string
  name: string
  code: string
  montantHT: number
  startDate: Date
  endDate: Date
  duration: number
  status: PhaseStatus
  progress: number
  observations: string | null
  createdAt: Date
  updatedAt: Date
}

export interface SubPhase {
  id: string
  phaseId: string
  name: string
  code: string | null
  status: SubPhaseStatus
  progress: number
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface GanttMarker {
  id: string
  projectId: string
  label: string
  date: Date
  className: string | null
  createdAt: Date
  updatedAt: Date
}

// ---------------------------------------------------
// Production
// ---------------------------------------------------

export interface Product {
  id: string
  phaseId: string
  taux: number
  montantProd: number
  date: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Production {
  id: string
  productId: string
  phaseId: string
  taux: number
  mntProd: number
  date: Date
  createdAt: Date
  updatedAt: Date
}

// ---------------------------------------------------
// Kanban
// ---------------------------------------------------

export interface Lane {
  id: string
  unitId: string
  companyId: string
  name: string
  color: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Tag {
  id: string
  unitId: string
  companyId: string
  name: string
  color: string
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  unitId: string
  companyId: string
  projectId: string
  phaseId: string
  subPhaseId: string | null
  laneId: string
  assignedUserId: string | null
  title: string
  description: string | null
  startDate: Date | null
  dueDate: Date | null
  endDate: Date | null
  complete: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface TaskTag {
  taskId: string
  tagId: string
  createdAt: Date
}

export interface TaskComment {
  id: string
  taskId: string
  authorId: string
  companyId: string
  body: string
  edited: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TaskMention {
  id: string
  commentId: string
  mentionedUserId: string
  companyId: string
  createdAt: Date
  updatedAt: Date
}

// ---------------------------------------------------
// Time Tracking
// ---------------------------------------------------

export interface TimeEntry {
  id: string
  companyId: string
  userId: string
  projectId: string
  taskId: string | null
  description: string | null
  startTime: Date
  endTime: Date
  duration: number // minutes
  createdAt: Date
  updatedAt: Date
}

// ---------------------------------------------------
// Notifications
// ---------------------------------------------------

export interface Notification {
  id: string
  companyId: string
  unitId: string | null
  userId: string
  type: NotificationType
  message: string
  read: boolean
  targetRole: Role | null
  targetUserId: string | null
  createdAt: Date
  updatedAt: Date
}

// ---------------------------------------------------
// Activity Logs
// ---------------------------------------------------

export interface ActivityLog {
  id: string
  companyId: string
  unitId: string | null
  userId: string
  action: "CREATE" | "UPDATE" | "DELETE"
  entityType: string
  entityId: string
  metadata: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
}

// ---------------------------------------------------
// Utility Types
// ---------------------------------------------------

/**
 * Session data from Clerk
 */
export interface SessionData {
  userId: string
  email: string
  role: Role | null
  companyId: string | null
  unitId: string | null
}

/**
 * Subscription status with computed fields
 */
export interface SubscriptionState {
  status: SubscriptionStatus
  daysRemaining: number
  isReadOnly: boolean
  isGrace: boolean
}

/**
 * Plan limit check result
 */
export interface PlanLimitResult {
  allowed: boolean
  current: number
  max: number | null
}

// ---------------------------------------------------
// Form Data Types
// ---------------------------------------------------

export interface OnboardingData {
  company: {
    name: string
    logo?: string
    formJur: LegalForm
    sector: Sector
    NIF: string
    RC: string
    NIS: string
    AI: string
    wilaya: Wilaya
    address: string
    phone: string
    email: string
  }
  unit: {
    name: string
    address?: string
    phone?: string
    email?: string
  }
  invitations?: Array<{
    email: string
    role: "ADMIN" | "USER"
  }>
}

export interface CreateProjectData {
  name: string
  code: string
  type?: string
  montantHT: number
  montantTTC: number
  ods: Date
  delaiMonths: number
  delaiDays: number
  status: ProjectStatus
  signe: boolean
  clientId?: string
}

export interface CreatePhaseData {
  name: string
  code: string
  montantHT: number
  startDate: Date
  endDate: Date
  status: PhaseStatus
  progress: number
  observations?: string
}

export interface CreateTaskData {
  title: string
  description?: string
  startDate?: Date
  dueDate?: Date
  phaseId: string
  subPhaseId?: string
  laneId: string
  assignedUserId?: string
  projectId: string
}

export interface CreateTimeEntryData {
  description?: string
  startTime: Date
  endTime: Date
  projectId: string
  taskId?: string
}
