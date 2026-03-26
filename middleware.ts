import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Define public routes - these bypass authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/company/sign-in(.*)",
  "/company/sign-up(.*)",
  "/onboarding(.*)",
  "/api/webhooks(.*)",
])

// Next.js 16 proxy.ts - uses clerkMiddleware as default export
// Clerk middleware handles auth protection for all non-public routes
export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, etc)
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|ts|tsx|json|xml|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
