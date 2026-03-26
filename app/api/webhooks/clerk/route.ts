import { Webhook } from "svix"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

interface WebhookEvent {
  data: {
    id: string
    email_addresses: Array<{ email_address: string }>
    first_name?: string | null
    last_name?: string | null
    public_metadata?: Record<string, unknown>
  }
  type: string
}

// Role enum from Prisma schema
const UserRole = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  USER: "USER",
} as const

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set")
    return new NextResponse("Webhook secret not configured", { status: 500 })
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Missing svix headers", { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Webhook verification failed:", err)
    return new NextResponse("Invalid signature", { status: 400 })
  }

  const eventType = evt.type

  try {
    switch (eventType) {
      case "user.created": {
        const { id: clerkId, email_addresses, first_name, last_name } = evt.data
        const email = email_addresses[0]?.email_address

        if (!email) {
          return new NextResponse("No email found", { status: 400 })
        }

        await prisma.user.create({
          data: {
            clerkId,
            email,
            name: [first_name, last_name].filter(Boolean).join(" ") || email,
            role: UserRole.USER, // Default role, will be updated after onboarding
          },
        })
        console.log(`Created user: ${email}`)
        break
      }

      case "user.updated": {
        const { id: clerkId, email_addresses, first_name, last_name } = evt.data
        const email = email_addresses[0]?.email_address

        if (!email) {
          return new NextResponse("No email found", { status: 400 })
        }

        await prisma.user.update({
          where: { clerkId },
          data: {
            email,
            name: [first_name, last_name].filter(Boolean).join(" ") || email,
          },
        })
        console.log(`Updated user: ${email}`)
        break
      }

      case "user.deleted": {
        const { id: clerkId } = evt.data

        await prisma.user.delete({
          where: { clerkId },
        })
        console.log(`Deleted user: ${clerkId}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${eventType}`)
    }

    return new NextResponse("Webhook processed", { status: 200 })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
