"use client"

import React from "react"
import { usePathname } from "next/navigation"

import { getBreadcrumb } from "@/lib/get-breadcrumb"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumb(pathname)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex justify-between h-16 px-4 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 ">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => (
                  <React.Fragment key={breadcrumb.label}>
                    <BreadcrumbItem className="hidden md:block">
                      {breadcrumb.href ? (
                        <BreadcrumbLink>{breadcrumb.label}</BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator
                        key={`sep-${index}`}
                        className="hidden md:block"
                      />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
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
