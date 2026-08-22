import type { Metadata } from "next"
import { DM_Serif_Display, Geist_Mono, Instrument_Sans } from "next/font/google"

import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const display = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "GlobeTrotter",
  description:
    "Plan multi-city trips, build day-wise itineraries, see your budget.",
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
        sans.variable,
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