// =====================================================
// PMA Supabase - Browser client
// =====================================================

import { createBrowserClient } from "@supabase/ssr"

/**
 * Supabase client for browser/client components
 * Uses cookies for session management
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Default export for convenience
 */
export const supabase = createClient()
