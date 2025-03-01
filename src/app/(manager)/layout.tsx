import { api } from "@/trpc/server"

import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ModeSwitcher } from "@/components/mode-switcher"
import { SearchMenu } from "@/components/search-menu"
import { Shell } from "@/components/shell"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { sidebarData } from "@/components/sidebar/sidebar-data"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const branch = await api.branch.getBranch()
  return (
    <SidebarProvider>
      <AppSidebar sidebarData={sidebarData} branch={branch} />
      <SidebarInset>
        <header className="flex justify-between h-16 px-4 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 ">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <SearchMenu />
            <ModeSwitcher />
          </div>
        </header>
        <div className="flex-1 px-4">
          <Shell className="md:py-4">{children}</Shell>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
