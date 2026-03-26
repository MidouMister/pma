import { DM_Sans, Geist_Mono, Oxanium } from "next/font/google"
import { Toaster } from "sonner"
import { ClerkProvider } from "@clerk/nextjs"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Provider as JotaiProvider } from "jotai"

const oxanium = Oxanium({subsets:['latin'],variable:'--font-sans'})

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="fr" suppressHydrationWarning className={cn("font-sans", oxanium.variable)}>
        <body
          className={cn(
            "antialiased",
            fontMono.variable,
            oxanium.variable,
            oxanium.variable,
            "font-sans"
          )}
        >
          <JotaiProvider>
            <ThemeProvider defaultTheme="light" attribute="class">
              <TooltipProvider delayDuration={0}>
                {children}
                <Toaster position="top-right" richColors />
              </TooltipProvider>
            </ThemeProvider>
          </JotaiProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
