import type { Metadata } from "next"
import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "GlobeTrotter",
  description: "Plan multi-city trips, build day-wise itineraries, see your budget.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased font-sans",
        inter.variable,
        display.variable,
        fontMono.variable,
      )}
    >
      <body>
        <ThemeProvider>
          {children}
          <Toaster position="top-left" />
        </ThemeProvider>
      </body>
    </html>
  )
}
