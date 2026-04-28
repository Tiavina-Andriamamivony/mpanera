import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { Button } from "../ui/button"
import { HeaderSearchBar } from "./headerSearchBar"
import { Logo } from "../icons/logo"
import { SidebarTrigger } from "../ui/sidebar"

export const Header = () => {
  return (
    <header className="sticky top-0 right-0 flex h-16 items-center justify-between gap-4 border-b bg-background/90 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="md:hidden">
          <Logo />
        </div>
        <HeaderSearchBar />
      </div>
      <div className="flex items-center gap-4">
        <Show when="signed-out">
          <SignInButton mode="modal" fallbackRedirectUrl="/app/explorer">
            <Button variant="ghost">Se connecter</Button>
          </SignInButton>
          <SignUpButton mode="modal" fallbackRedirectUrl="/app/explorer">
            <Button>S&apos;inscrire</Button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  )
}
