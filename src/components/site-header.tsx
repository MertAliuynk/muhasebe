import type { NavigationItem } from "@/types"

import { MainNav } from "./main-nav"
import { ModeSwitcher } from "./mode-switcher"
import { SearchMenu } from "./search-menu"

type Props = {
  navigationItems: NavigationItem[]
}

export function SiteHeader({ navigationItems }: Props) {
  return (
    <header className="border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-wrapper">
        <div className="container flex h-14 items-center">
          <MainNav navigationItems={navigationItems} />
          <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <SearchMenu />
            </div>
            <nav className="flex items-center gap-0.5">
              <ModeSwitcher />
              {/* <UserButton /> */}
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
