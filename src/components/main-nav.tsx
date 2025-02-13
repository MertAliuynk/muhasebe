"use client"

import * as React from "react"
import Link from "next/link"
import type { NavigationItem } from "@/types"
import {
  BriefcaseMedical,
  Building,
  CircleUserRound,
  File,
  Home,
  UserPlus,
  Users,
  UserSearch,
  Vault,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

import Logo from "./logo"

type Props = {
  navigationItems: NavigationItem[]
}

const iconMap = {
  Home: Home,
  Vault: Vault,
  BriefcaseMedical: BriefcaseMedical,
  UserSearch: UserSearch,
  UserPlus: UserPlus,
  Users: Users,
  File: File,
  Building: Building,
  CircleUserRound: CircleUserRound,
}

export function MainNav({ navigationItems }: Props) {
  const itemsWithIcons = navigationItems.map((item) => ({
    ...item,
    icon: iconMap[item.icon as keyof typeof iconMap] as LucideIcon,
  }))

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-4 flex items-center gap-2 lg:mr-6">
        <Logo textClassName="text-sm font-medium" className="items-end" />
      </Link>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem></NavigationMenuItem>
          {itemsWithIcons.map((item) => (
            <NavigationMenuItem key={item.title}>
              {item.isDropdown ? (
                <>
                  <NavigationMenuTrigger className="flex items-center gap-2">
                    {item.icon && <item.icon className="size-4" />}
                    {item.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[400px] ">
                      {item.children?.map((child) => (
                        <ListItem
                          key={child.title}
                          title={child.title}
                          href={child.href}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <div className="text-sm font-medium leading-none">
                                {child.title}
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {child.description}
                              </p>
                            </div>
                            {child.icon &&
                              React.createElement(child.icon, {
                                className: "size-4 text-muted-foreground",
                              })}
                          </div>
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </>
              ) : (
                <Link href={item.href!} legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "flex items-center gap-2"
                    )}
                  >
                    {item.icon && <item.icon className="size-4" />}
                    {item.title}
                  </NavigationMenuLink>
                </Link>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={props.href!}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          {children}
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
