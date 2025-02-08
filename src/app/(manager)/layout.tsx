import { SiteHeader } from "@/components/site-header"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div data-wrapper="" className="border-grid flex flex-1 flex-col">
      <SiteHeader />
      <div className="container-wrapper py-4">
        <main className="container flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  )
}
