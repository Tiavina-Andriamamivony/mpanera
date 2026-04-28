import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Fraunces, DM_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
})

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
})

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Mpanera — L'art du service à Madagascar",
  description:
    "La place de marché qui relie les artisans et les clients à travers Madagascar.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body
        className={`${fraunces.variable} ${dmSans.variable} ${jetbrains.variable} h-screen font-body antialiased`}
      >
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  )
}
