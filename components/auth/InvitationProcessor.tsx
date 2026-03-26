"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

interface InvitationData {
  unitId: string
  companyId: string
  role: "ADMIN" | "USER"
}

/**
 * InvitationProcessor - Handles invitation token processing after sign-up
 * This component is mounted when a user signs up via an invitation link
 */
export function InvitationProcessor() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function processInvitation() {
      if (!isLoaded || !user) return

      // Get token from URL
      const searchParams = new URLSearchParams(window.location.search)
      const token = searchParams.get("token")

      if (!token) {
        // No token - just redirect to dashboard
        router.replace("/dashboard")
        return
      }

      try {
        // Call the server action to accept invitation
        const response = await fetch("/api/invitations/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to accept invitation")
        }

        const data = (await response.json()) as InvitationData

        // Redirect based on role
        if (data.role === "ADMIN") {
          router.replace(`/unite/${data.unitId}`)
        } else {
          router.replace(`/user/${user.id}`)
        }
      } catch (err) {
        console.error("Invitation processing error:", err)
        setError(
          err instanceof Error ? err.message : "Failed to process invitation"
        )
        setIsProcessing(false)
      }
    }

    processInvitation()
  }, [user, isLoaded, router])

  if (!isLoaded || isProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">Processing invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-destructive">
            Invitation Failed
          </h2>
          <p className="mb-4 text-muted-foreground">{error}</p>
          <button
            onClick={() => router.replace("/dashboard")}
            className="text-primary hover:underline"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return null
}
