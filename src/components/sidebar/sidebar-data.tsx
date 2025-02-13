"use client"

import {
  BriefcaseMedical,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Settings,
  UserCog,
  Users,
  Vault,
} from "lucide-react"

import { type SidebarData } from "./types"

export const sidebarData: SidebarData = {
  user: {
    name: "rimedtades",
    email: "hepsedat@gmail.com",
    avatar: "/images/avatar.png",
  },

  navGroups: [
    {
      title: "Genel",
      items: [
        {
          title: "Anasayfa",
          url: "/",
          icon: LayoutDashboard,
        },
        {
          title: "Günlük Kasa",
          url: "/gunluk-kasa",
          icon: Vault,
        },
        {
          title: "Raporlar",
          url: "/rapor",
          icon: FileText,
        },
      ],
    },
    {
      title: "Sayfalar",
      items: [
        {
          title: "Hastalar",
          icon: Users,
          items: [
            {
              title: "Listele",
              url: "/hasta",
            },
            {
              title: "Ekle",
              url: "/hasta/ekle",
            },
          ],
        },
        {
          title: "Hekimler",
          icon: BriefcaseMedical,
          items: [
            {
              title: "Listele",
              url: "/hekim",
            },
            {
              title: "Ekle",
              url: "/hekim/ekle",
            },
          ],
        },
      ],
    },
    {
      title: "Diğer",
      items: [
        {
          title: "Ayarlar",
          icon: Settings,
          items: [
            {
              title: "Profil",
              url: "/settings",
              icon: UserCog,
            },
          ],
        },
        {
          title: "Yardım",
          url: "/yardim",
          icon: HelpCircle,
        },
      ],
    },
  ],
}
