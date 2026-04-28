"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import { ApiError } from "@/lib/api"
import { usersService } from "@/lib/services"

export function OnboardingGate({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function checkOnboarding() {
      if (typeof window === "undefined") return

      const token = window.localStorage.getItem("accessToken")
      if (!token) {
        if (!cancelled) setReady(true)
        return
      }

      try {
        const me = await usersService.me()
        if (cancelled) return

        if (!me.onboardingComplete && pathname !== "/app/onboarding") {
          router.replace("/app/onboarding")
          return
        }

        if (me.onboardingComplete && pathname === "/app/onboarding") {
          router.replace("/app/explorer")
          return
        }
      } catch (error) {
        if (cancelled) return
        if (!(error instanceof ApiError) || error.status !== 401) {
          console.error("Echec de la verification du statut d'onboarding", error)
        }
      } finally {
        if (!cancelled) setReady(true)
      }
    }

    void checkOnboarding()

    return () => {
      cancelled = true
    }
  }, [pathname, router])

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-sm text-muted-foreground">
        Verification de votre progression...
      </div>
    )
  }

  return <>{children}</>
}
