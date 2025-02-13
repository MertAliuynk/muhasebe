import { ceoNavigationItems } from "@/config/site"
import { SiteHeader } from "@/components/site-header"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div data-wrapper="" className="border-grid flex flex-1 flex-col">
      <SiteHeader navigationItems={ceoNavigationItems} />
      <div className="container-wrapper py-10 max-w-6xl">
        <main className="container flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  )
}
