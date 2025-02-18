"use client"

import {
  BriefcaseMedical,
  Building,
  CircleUserRound,
  FileText,
  HelpCircle,
  LayoutDashboard,
  NotebookPen,
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

export const sidebarDataCeo: SidebarData = {
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
          title: "Yöneticiler",
          url: "/ceo/yonetici",
          icon: CircleUserRound,
        },
        {
          title: "Şubeler",
          url: "/ceo/sube",
          icon: Building,
        },
        {
          title: "Hastalar",
          url: "/ceo/hasta",
          icon: Users,
        },
        {
          title: "Hekimler",
          url: "/ceo/hekim",
          icon: BriefcaseMedical,
        },
        {
          title: "Gider Kalemleri",
          url: "/ceo/gider",
          icon: NotebookPen,
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
