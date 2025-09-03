"use client"

import {
  BriefcaseMedical,
  Building,
  CircleUserRound,
  FileText,
  LayoutDashboard,
  Mails,
  NotebookPen,
  Settings,
  SquareUserRound,
  UserCog,
  Users,
  Vault,
} from "lucide-react"

import { type SidebarData } from "./types"

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: "Genel",
      items: [
        {
          title: "Günlük Kasa",
          url: "/gunluk-kasa",
          icon: Vault,
        },
        {
          title: "Raporlar",
          url: "/raporlar",
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
          url: "/hasta",
        },
        {
          title: "Hekimler",
          icon: BriefcaseMedical,
          url: "/hekim",
        },
        {
          title: "ödeme listeleri",
          icon: BriefcaseMedical,
          url: "/odeme-listesi",
        }
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
              url: "/profil",
              icon: UserCog,
            },
          ],
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
          url: "/ceo",
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
          title: "Sekreterler",
          url: "/ceo/sekreter",
          icon: SquareUserRound,
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
        {
          title: "Sms Gönder",
          url: "/ceo/sms",
          icon: Mails,
        },
        {
          title: "İncele",
          url: "/ceo/incele",
          icon: FileText,
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
      ],
    },
  ],
}

export const sidebarDataDoctor: SidebarData = {
  navGroups: [
    {
      title: "Genel",
      items: [
        {
          title: "Anasayfa",
          url: "/doktor",
          icon: LayoutDashboard,
        },
      ],
    },
  ],
}

export const sidebarDataSecretary: SidebarData = {
  navGroups: [
    {
      title: "Genel",
      items: [
        {
          title: "Günlük Kasa",
          url: "/sekreter",
          icon: Vault,
        },
        {
          title: "Hastalar",
          url: "/sekreter/hasta",
          icon: Users,
        },
      ],
    },
  ],
}
