"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  BriefcaseBusiness,
  Compass,
  LifeBuoy,
  MessageSquare,
  Plus,
  Settings,
  Star,
} from "lucide-react"

import { Logo } from "@/components/icons/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"

const mainNav = [
  { title: "Explorer", url: "/app/explorer", icon: Compass },
  {
    title: "Demandes",
    url: "/app/requests",
    icon: BriefcaseBusiness,
    badge: "4",
  },
  { title: "Messages", url: "/app/messages", icon: MessageSquare, badge: "2" },
]

const secondaryNav = [
  { title: "Notifications", url: "/app/notifications", icon: Bell },
  { title: "Avis", url: "/app/avis", icon: Star },
]

const utilityNav = [
  { title: "Support", url: "/app/support", icon: LifeBuoy },
  { title: "Parametres", url: "/app/parametres", icon: Settings },
]

export function AppSidebar() {
  const { open, isMobile } = useSidebar()
  const pathname = usePathname()
  const isExpanded = open || isMobile
  const isItemActive = (url: string) =>
    pathname === url || pathname.startsWith(`${url}/`)

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="gap-3 p-3">
        <Link
          href="/app/explorer"
          className="flex items-center gap-3 rounded-xl px-2 py-2 text-sidebar-foreground"
        >
          <div
            className={cn([
              "flex size-9 items-center justify-center rounded-lg",
              isExpanded
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "bg-transparent text-sidebar-primary",
            ])}
          >
            M
          </div>
          {isExpanded ? (
            <div className="flex min-w-0 flex-col">
              <Logo />
              <span className="text-xs text-sidebar-foreground/70">
                Services locaux
              </span>
            </div>
          ) : null}
        </Link>

        {/* {isExpanded ? (
          <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/35 p-3">
            <p className="text-xs uppercase tracking-[0.24em] text-sidebar-foreground/55">
              Zone active
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-sidebar-foreground">Analakely</p>
                <p className="mt-1 text-xs text-sidebar-foreground/65">
                  128 prestataires autour de vous
                </p>
              </div>
              <MapPin className="size-4 text-sidebar-foreground/60" />
            </div>
            <SidebarInput className="mt-3 bg-background" placeholder="Rechercher un service" />
          </div>
        ) : null} */}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isItemActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge ? (
                    <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Suivi</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isItemActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isExpanded ? (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Actions rapides</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="flex flex-col gap-2 px-2">
                  <Button type="button" className="flex items-center">
                    <Plus className="size-4" />
                    Nouvelle demande
                  </Button>
                  {/* <div className="rounded-xl border border-sidebar-border bg-background/60 px-3 py-3">
                    <p className="text-sm font-medium text-sidebar-foreground">
                      2 nouvelles reponses
                    </p>
                    <p className="mt-1 text-xs leading-5 text-sidebar-foreground/65">
                      Felana et Tovo ont propose un passage aujourd&apos;hui.
                    </p>
                  </div> */}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : null}
      </SidebarContent>

      <SidebarFooter className="p-3">
        {/* {isExpanded ? (
          <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/35 p-3">
            <p className="text-xs tracking-[0.24em] text-sidebar-foreground/55 uppercase">
              Statut
            </p>
            <p className="mt-3 text-sm font-medium text-sidebar-foreground">
              4 demandes en cours
            </p>
            <p className="mt-1 text-xs text-sidebar-foreground/65">
              2 reponses a verifier avant 14h00.
            </p>
          </div>
        ) : null} */}
        <SidebarMenu>
          {utilityNav.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isItemActive(item.url)}
                tooltip={item.title}
              >
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
