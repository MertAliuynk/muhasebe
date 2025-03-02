import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ModeSwitcher } from "@/components/mode-switcher"
import { Shell } from "@/components/shell"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { sidebarDataCeo } from "@/components/sidebar/sidebar-data"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar sidebarData={sidebarDataCeo} branch={null} />
      <SidebarInset>
        <header className="flex justify-between h-16 px-4 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 ">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="flex items-center gap-2">
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
