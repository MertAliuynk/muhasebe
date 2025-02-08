"use client"

import * as React from "react"
import Link from "next/link"
import {
  BriefcaseMedical,
  File,
  Home,
  Hospital,
  UserPlus,
  Users,
  UserSearch,
  Vault,
  type LucideIcon,
} from "lucide-react"

import { siteConfig } from "@/config/site"
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

interface NavigationItem {
  title: string
  href?: string
  icon?: LucideIcon
  description?: string
  isDropdown?: boolean
  children?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  {
    title: "Ana Sayfa",
    href: "/",
    icon: Home,
  },
  {
    title: "Günlük Kasa",
    href: "/gunluk-kasa",
    icon: Vault,
  },
  {
    title: "Hekimler",
    icon: BriefcaseMedical,
    isDropdown: true,
    children: [
      {
        title: "Hekimleri Listele",
        href: "/hekim",
        icon: UserSearch,
        description: "Hekimleri listeleyebilirsiniz.",
      },
      {
        title: "Hekim Ekle",
        icon: UserPlus,
        href: "/hekim/ekle",
        description: "Yeni bir hekim kaydı eklemek için bu alanı kullanın.",
      },
    ],
  },
  {
    title: "Hastalar",
    icon: Users,
    isDropdown: true,
    children: [
      {
        title: "Hastaları Listele",
        href: "/hasta",
        icon: UserSearch,
        description: "Hastahaneye ait tüm hastaları listeleyebilirsiniz.",
      },
      {
        title: "Hasta Ekle",
        href: "/hasta/ekle",
        icon: UserPlus,
        description: "Yeni bir hasta kaydı eklemek için bu alanı kullanın.",
      },
    ],
  },
  {
    title: "Raporlar",
    icon: File,
    href: "/rapor",
  },
]

export function MainNav() {
  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-4 flex items-center gap-2 lg:mr-6">
        <Hospital className="h-6 w-6" />
        <span className="hidden font-bold lg:inline-block text-sm">
          {siteConfig.name}
        </span>
      </Link>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem></NavigationMenuItem>
          {navigationItems.map((item) => (
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
                            {child.icon && (
                              <child.icon className="size-4 text-muted-foreground" />
                            )}
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
