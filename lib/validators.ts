// =====================================================
// PMA Validators - Zod schemas for all entities
// =====================================================

import { z } from "zod"

// ---------------------------------------------------
// Enums (matching Prisma schema)
// ---------------------------------------------------

export const RoleEnum = z.enum(["OWNER", "ADMIN", "USER"])

export const ProjectStatusEnum = z.enum([
  "New",
  "InProgress",
  "Pause",
  "Complete",
])

export const PhaseStatusEnum = z.enum([
  "New",
  "InProgress",
  "Pause",
  "Complete",
])

export const SubPhaseStatusEnum = z.enum([
  "New",
  "InProgress",
  "Pause",
  "Complete",
])

export const InvitationStatusEnum = z.enum([
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
])

export const NotificationTypeEnum = z.enum([
  "INVITATION",
  "PROJECT",
  "TASK",
  "TEAM",
  "PHASE",
  "CLIENT",
  "PRODUCTION",
  "LANE",
  "TAG",
  "GENERAL",
])

export const SubscriptionStatusEnum = z.enum([
  "TRIAL",
  "ACTIVE",
  "GRACE",
  "READONLY",
  "SUSPENDED",
])

// ---------------------------------------------------
// Legal Forms & Sectors
// ---------------------------------------------------

export const LegalFormEnum = z.enum([
  "SARL",
  "EURL",
  "SPA",
  "EIRL",
  "SNC",
  "Autre",
])

export const SectorEnum = z.enum([
  "Construction",
  "Engineering",
  "PublicWorks",
  "Industry",
  "Autre",
])

// ---------------------------------------------------
// Common Validators
// ---------------------------------------------------

// Algerian NIF: 20 digits
export const NIFSchema = z
  .string()
  .regex(/^\d{20}$/, "NIF doit contenir exactement 20 chiffres")

// RC: alphanumeric, max 20 chars
export const RCSchema = z
  .string()
  .regex(
    /^[A-Za-z0-9]{1,20}$/,
    "RC doit contenir uniquement des lettres et chiffres"
  )

// NIS: 21 digits
export const NISSchema = z
  .string()
  .regex(/^\d{21}$/, "NIS doit contenir exactement 21 chiffres")

// AI: 22 digits
export const AISchema = z
  .string()
  .regex(/^\d{22}$/, "AI doit contenir exactement 22 chiffres")

// Phone: Algerian format
export const PhoneSchema = z
  .string()
  .regex(/^(\+213|0)[5-7]\d{8}$/, "Numéro de téléphone algérien invalide")

// Email
export const EmailSchema = z.string().email("Email invalide")

// Positive number
export const PositiveNumberSchema = z.number().positive("Doit être positif")

// Non-negative number
export const NonNegativeNumberSchema = z
  .number()
  .min(0, "Ne peut pas être négatif")

// Date in future
export const FutureDateSchema = z.coerce
  .date()
  .refine((date) => date > new Date(), {
    message: "La date doit être dans le futur",
  })

// Date not in past
export const PastDateSchema = z.coerce
  .date()
  .refine((date) => date <= new Date(), {
    message: "La date ne peut pas être dans le futur",
  })

// ---------------------------------------------------
// Company Schema
// ---------------------------------------------------

export const companySchema = z.object({
  name: z.string().min(1, "Nom requis").max(255),
  logo: z.string().url().optional(),
  formJur: LegalFormEnum,
  sector: SectorEnum,
  NIF: NIFSchema,
  RC: RCSchema,
  NIS: NISSchema,
  AI: AISchema,
  wilaya: z.string().min(1, "Wilaya requise"),
  address: z.string().min(1, "Adresse requise").max(500),
  phone: PhoneSchema,
  email: EmailSchema,
  productionAlertThreshold: z.number().min(1).max(100).default(80),
})

export type CompanyFormData = z.infer<typeof companySchema>

// ---------------------------------------------------
// Unit Schema
// ---------------------------------------------------

export const unitSchema = z.object({
  name: z.string().min(1, "Nom requis").max(100),
  address: z.string().max(500).optional(),
  phone: PhoneSchema.optional().or(z.literal("")),
  email: EmailSchema.optional().or(z.literal("")),
})

export type UnitFormData = z.infer<typeof unitSchema>

// ---------------------------------------------------
// Invitation Schema
// ---------------------------------------------------

export const invitationSchema = z.object({
  email: EmailSchema,
  role: RoleEnum.exclude(["OWNER"]), // Cannot invite OWNER role
})

export type InvitationFormData = z.infer<typeof invitationSchema>

// ---------------------------------------------------
// Client Schema
// ---------------------------------------------------

export const clientSchema = z.object({
  name: z.string().min(1, "Nom requis").max(255),
  wilaya: z.string().optional(),
  phone: PhoneSchema.optional().or(z.literal("")),
  email: EmailSchema.optional().or(z.literal("")),
})

export type ClientFormData = z.infer<typeof clientSchema>

// ---------------------------------------------------
// Project Schema
// ---------------------------------------------------

export const projectSchema = z
  .object({
    name: z.string().min(1, "Nom requis").max(255),
    code: z.string().min(1, "Code requis").max(50),
    type: z.string().max(100).optional(),
    montantHT: PositiveNumberSchema,
    montantTTC: PositiveNumberSchema,
    ods: z.coerce.date(),
    delaiMonths: z.number().int().min(0).default(0),
    delaiDays: z.number().int().min(0).default(0),
    status: ProjectStatusEnum.default("New"),
    signe: z.boolean().default(false),
    clientId: z.string().optional(),
  })
  .refine((data) => data.montantTTC >= data.montantHT, {
    message: "Le montant TTC doit être supérieur ou égal au montant HT",
    path: ["montantTTC"],
  })

export type ProjectFormData = z.infer<typeof projectSchema>

// ---------------------------------------------------
// Phase Schema
// ---------------------------------------------------

export const phaseSchema = z.object({
  name: z.string().min(1, "Nom requis").max(255),
  code: z.string().min(1, "Code requis").max(50),
  montantHT: PositiveNumberSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: PhaseStatusEnum.default("New"),
  progress: z.number().min(0).max(100).default(0),
  observations: z.string().max(1000).optional(),
})

export type PhaseFormData = z.infer<typeof phaseSchema>

// ---------------------------------------------------
// SubPhase Schema
// ---------------------------------------------------

export const subPhaseSchema = z.object({
  name: z.string().min(1, "Nom requis").max(255),
  code: z.string().max(50).optional(),
  status: SubPhaseStatusEnum.default("New"),
  progress: z.number().min(0).max(100).default(0),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
})

export type SubPhaseFormData = z.infer<typeof subPhaseSchema>

// ---------------------------------------------------
// Gantt Marker Schema
// ---------------------------------------------------

export const ganttMarkerSchema = z.object({
  label: z.string().min(1, "Label requis").max(100),
  date: z.coerce.date(),
  className: z.string().max(50).optional(),
})

export type GanttMarkerFormData = z.infer<typeof ganttMarkerSchema>

// ---------------------------------------------------
// Product Schema (Production baseline)
// ---------------------------------------------------

export const productSchema = z.object({
  taux: z.number().min(0).max(100),
  montantProd: PositiveNumberSchema,
  date: z.coerce.date().optional(),
})

export type ProductFormData = z.infer<typeof productSchema>

// ---------------------------------------------------
// Production Schema
// ---------------------------------------------------

export const productionSchema = z.object({
  taux: z.number().min(0).max(100),
  date: z.coerce.date(),
})

export type ProductionFormData = z.infer<typeof productionSchema>

// ---------------------------------------------------
// Lane Schema
// ---------------------------------------------------

export const laneSchema = z.object({
  name: z.string().min(1, "Nom requis").max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hexadécimale requise"),
  order: z.number().int().min(0),
})

export type LaneFormData = z.infer<typeof laneSchema>

// ---------------------------------------------------
// Tag Schema
// ---------------------------------------------------

export const tagSchema = z.object({
  name: z.string().min(1, "Nom requis").max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hexadécimale requise"),
})

export type TagFormData = z.infer<typeof tagSchema>

// ---------------------------------------------------
// Task Schema
// ---------------------------------------------------

export const taskSchema = z.object({
  title: z.string().min(1, "Titre requis").max(255),
  description: z.string().max(2000).optional(),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  phaseId: z.string().min(1, "Phase requise"),
  subPhaseId: z.string().optional(),
  laneId: z.string().min(1, "Lane requise"),
  assignedUserId: z.string().optional(),
  projectId: z.string().min(1, "Projet requis"),
  order: z.number().int().min(0).default(0),
  complete: z.boolean().default(false),
})

export type TaskFormData = z.infer<typeof taskSchema>

// ---------------------------------------------------
// Comment Schema
// ---------------------------------------------------

export const commentSchema = z.object({
  body: z
    .string()
    .min(1, "Message requis")
    .max(2000, "Maximum 2000 caractères"),
})

export type CommentFormData = z.infer<typeof commentSchema>

// ---------------------------------------------------
// Time Entry Schema
// ---------------------------------------------------

export const timeEntrySchema = z
  .object({
    description: z.string().max(500).optional(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    projectId: z.string().min(1, "Projet requis"),
    taskId: z.string().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "L'heure de fin doit être après l'heure de début",
    path: ["endTime"],
  })

export type TimeEntryFormData = z.infer<typeof timeEntrySchema>

// ---------------------------------------------------
// Notification Schema
// ---------------------------------------------------

export const notificationSchema = z.object({
  companyId: z.string(),
  unitId: z.string().optional(),
  userId: z.string(),
  type: NotificationTypeEnum,
  message: z.string().min(1).max(500),
  read: z.boolean().default(false),
  targetRole: RoleEnum.optional(),
  targetUserId: z.string().optional(),
})

export type NotificationFormData = z.infer<typeof notificationSchema>

// ---------------------------------------------------
// Onboarding Schemas
// ---------------------------------------------------

export const onboardingCompanySchema = companySchema.omit({
  NIF: true,
  RC: true,
  NIS: true,
  AI: true,
})

export const onboardingStep1Schema = z.object({
  company: onboardingCompanySchema,
})

export const onboardingStep2Schema = z.object({
  unit: unitSchema,
})

export const onboardingStep3Schema = z.object({
  invitations: z.array(invitationSchema).max(10, "Maximum 10 invitations"),
})

export const onboardingFullSchema = z
  .object({
    company: companySchema.omit({
      productionAlertThreshold: true,
    }),
    unit: unitSchema,
    invitations: z.array(invitationSchema).max(10).optional(),
  })
  .refine(
    (data) => {
      // Validate NIF format
      return /^\d{20}$/.test(data.company.NIF)
    },
    {
      message: "NIF invalide",
      path: ["company", "NIF"],
    }
  )

export type OnboardingFormData = z.infer<typeof onboardingFullSchema>

// ---------------------------------------------------
// Upgrade Request Schema
// ---------------------------------------------------

export const upgradeRequestSchema = z.object({
  plan: z.enum(["Pro", "Premium"]),
  contactEmail: EmailSchema,
  phone: PhoneSchema,
  paymentMethod: z.enum(["Virement Bancaire", "Chèque", "Autre"]),
  message: z.string().max(1000).optional(),
})

export type UpgradeRequestFormData = z.infer<typeof upgradeRequestSchema>
