"use client"

import * as React from "react"
import Link from "next/link"
import { type RouterOutputs } from "@/trpc/react"
import { Hospital, UserPlus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/sidebar/nav-user"

import { NavGroup } from "./nav-group"
import type { SidebarData } from "./types"

export function AppSidebar({
  sidebarData,
  branch,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  sidebarData: SidebarData
  branch: RouterOutputs["branch"]["getBranch"] | null
}) {
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon" {...props}>
      {branch && (
        <SidebarHeader>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Hospital className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {branch?.company.name}
              </span>
              <span className="truncate text-xs">{branch?.name} Şube</span>
            </div>
          </SidebarMenuButton>

          <Link
            href="/hasta/ekle"
            className={cn("mt-5 px-4", state === "collapsed" && "px-0")}
          >
            <Button
              size={state === "collapsed" ? "icon" : "sm"}
              className="w-full h-8"
            >
              <UserPlus
                className={cn("size-4 mr-2", state === "collapsed" && "mr-0")}
              />
              {state !== "collapsed" && <p>Yeni Hasta Ekle</p>}
            </Button>
          </Link>
        </SidebarHeader>
      )}
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
