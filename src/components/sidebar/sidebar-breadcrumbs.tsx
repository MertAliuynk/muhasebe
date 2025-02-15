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

export default function SidebarBreadcrumbs() {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumb(pathname)

  return (
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
  )
}
