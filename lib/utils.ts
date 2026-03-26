// =====================================================
// PMA Utilities - Helper functions
// =====================================================

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { LegalForm, Sector } from "./types"

// ---------------------------------------------------
// cn - Class name merger
// ---------------------------------------------------

/**
 * Merge class names with tailwind-merge
 * Standard utility for shadcn/ui components
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ---------------------------------------------------
// Formatting Utilities
// ---------------------------------------------------

/**
 * Format amount in Algerian Dinar format
 * Example: 1234567.89 → "1 234 567,89 DA"
 */
export function formatAmount(amount: number): string {
  if (amount === 0) return "0,00 DA"

  const formatted = new Intl.NumberFormat("fr-DZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  return `${formatted} DA`
}

/**
 * Format date to French format
 * Example: 2024-01-15 → "15/01/2024"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("fr-DZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d)
}

/**
 * Format date with time
 * Example: 2024-01-15 14:30 → "15/01/2024 à 14h30"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("fr-DZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(d)
    .replace(" ", " à ")
}

/**
 * Format deadline (délai) display
 * Example: (3, 15) → "3 mois 15 jours"
 */
export function formatDelai(months: number, days: number): string {
  const parts: string[] = []

  if (months > 0) {
    parts.push(`${months} mois`)
  }

  if (days > 0) {
    parts.push(`${days} jours`)
  }

  return parts.join(" ") || "0 jour"
}

/**
 * Calculate TVA (TVA amount and percentage)
 */
export function calculateTVA(
  montantHT: number,
  montantTTC: number
): {
  amount: number
  percentage: number
} {
  const amount = montantTTC - montantHT
  const percentage = montantHT > 0 ? (amount / montantHT) * 100 : 0

  return {
    amount: Math.round(amount * 100) / 100,
    percentage: Math.round(percentage * 100) / 100,
  }
}

/**
 * Calculate project progress as weighted average
 * Formula: Σ(Phase.progress × Phase.montantHT) / Σ(Phase.montantHT)
 */
export function calculateProgress(
  phases: Array<{ progress: number; montantHT: number }>
): number {
  if (phases.length === 0) return 0

  const totalMontantHT = phases.reduce((sum, p) => sum + p.montantHT, 0)
  if (totalMontantHT === 0) return 0

  const weightedSum = phases.reduce(
    (sum, p) => sum + p.progress * p.montantHT,
    0
  )
  return Math.round((weightedSum / totalMontantHT) * 100) / 100
}

/**
 * Format relative time (e.g., "il y a 5 minutes")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return "à l'instant"
  if (diffMinutes < 60)
    return `il y a ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`
  if (diffHours < 24)
    return `il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`
  if (diffDays < 30) return `il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`

  return formatDate(d)
}

// ---------------------------------------------------
// Legal Form Display
// ---------------------------------------------------

export const LEGAL_FORM_LABELS: Record<LegalForm, string> = {
  SARL: "Société à Responsabilité Limitée",
  EURL: "Entreprise Unipersonnelle à Responsabilité Limitée",
  SPA: "Société par Actions",
  EIRL: "Entreprise Individuelle à Responsabilité Limitée",
  SNC: "Société en Nom Collectif",
  Autre: "Autre",
}

export function formatLegalForm(form: LegalForm): string {
  return LEGAL_FORM_LABELS[form] || form
}

// ---------------------------------------------------
// Sector Display
// ---------------------------------------------------

export const SECTOR_LABELS: Record<Sector, string> = {
  Construction: "Bâtiment et Construction",
  Engineering: "Ingénierie",
  PublicWorks: "Travaux Publics",
  Industry: "Industrie",
  Autre: "Autre",
}

export function formatSector(sector: Sector): string {
  return SECTOR_LABELS[sector] || sector
}

// ---------------------------------------------------
// Status Colors
// ---------------------------------------------------

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-500",
  InProgress: "bg-green-500",
  Pause: "bg-yellow-500",
  Complete: "bg-gray-500",
}

export const PHASE_STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-500",
  InProgress: "bg-green-500",
  Pause: "bg-yellow-500",
  Complete: "bg-gray-500",
}

export function getStatusColor(status: string): string {
  return PROJECT_STATUS_COLORS[status] || "bg-gray-500"
}

// ---------------------------------------------------
// Date Validation Helpers
// ---------------------------------------------------

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date): boolean {
  return date < new Date()
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * Calculate duration in days between two dates
 */
export function calculateDurationDays(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// ---------------------------------------------------
// Validation Helpers
// ---------------------------------------------------

/**
 * Validate Algerian phone number
 */
export function isValidAlgerianPhone(phone: string): boolean {
  return /^(\+213|0)[5-7]\d{8}$/.test(phone)
}

/**
 * Validate NIF (20 digits)
 */
export function isValidNIF(nif: string): boolean {
  return /^\d{20}$/.test(nif)
}

/**
 * Validate NIS (21 digits)
 */
export function isValidNIS(nis: string): boolean {
  return /^\d{21}$/.test(nis)
}

/**
 * Validate AI (22 digits)
 */
export function isValidAI(ai: string): boolean {
  return /^\d{22}$/.test(ai)
}

// ---------------------------------------------------
// Number Formatting
// ---------------------------------------------------

/**
 * Format number with thousand separators (French)
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("fr-DZ").format(num)
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`
}

// ---------------------------------------------------
// Color Utilities
// ---------------------------------------------------

/**
 * Generate a lighter version of a hex color
 */
export function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt)
  const B = Math.min(255, (num & 0x0000ff) + amt)
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`
}

/**
 * Check if a color is dark (for contrast)
 */
export function isDarkColor(hex: string): boolean {
  const num = parseInt(hex.replace("#", ""), 16)
  const R = num >> 16
  const G = (num >> 8) & 0x00ff
  const B = num & 0x0000ff
  // Using perceived brightness formula
  return R * 0.299 + G * 0.587 + B * 0.114 < 128
}

// ---------------------------------------------------
// Slug Utilities
// ---------------------------------------------------

/**
 * Generate a URL-friendly slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with -
    .replace(/^-+|-+$/g, "") // Trim - from start/end
}

// ---------------------------------------------------
// Error Formatting
// ---------------------------------------------------

/**
 * Format Zod error messages for display
 */
export function formatZodErrors(error: unknown): string[] {
  if (error && typeof error === "object" && "issues" in error) {
    const issues = (error as { issues: Array<{ message: string }> }).issues
    return issues.map((issue) => issue.message)
  }
  return ["Une erreur s'est produite"]
}

// ---------------------------------------------------
// Subscription Helpers
// ---------------------------------------------------

/**
 * Calculate days remaining until a date
 */
export function daysRemaining(targetDate: Date | string): number {
  const target =
    typeof targetDate === "string" ? new Date(targetDate) : targetDate
  const now = new Date()
  const diffMs = target.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Get subscription status color
 */
export function getSubscriptionStatusColor(daysRemainingValue: number): string {
  if (daysRemainingValue > 14) return "text-green-500"
  if (daysRemainingValue > 3) return "text-yellow-500"
  return "text-red-500"
}

// ---------------------------------------------------
// Array Utilities
// ---------------------------------------------------

/**
 * Group array items by a key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key])
      if (!result[groupKey]) {
        result[groupKey] = []
      }
      result[groupKey].push(item)
      return result
    },
    {} as Record<string, T[]>
  )
}

/**
 * Sort array by multiple keys
 */
export function sortBy<T>(array: T[], ...keys: Array<keyof T>): T[] {
  return [...array].sort((a, b) => {
    for (const key of keys) {
      const aVal = a[key]
      const bVal = b[key]
      if (aVal < bVal) return -1
      if (aVal > bVal) return 1
    }
    return 0
  })
}
