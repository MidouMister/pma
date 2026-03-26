// =====================================================
// PMA Theme Store - Dark/Light mode atom
// =====================================================

import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

/**
 * Theme preference atom
 * Persisted to localStorage via atomWithStorage
 */
export const themeAtom = atomWithStorage<"light" | "dark">("pma-theme", "light")

/**
 * Sidebar collapsed state
 * Note: sidebar-07 manages its own state via cookie
 * This atom is for any additional components that need to know
 */
export const sidebarCollapsedAtom = atom(false)
