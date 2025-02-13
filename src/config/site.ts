import type { NavigationItem } from "@/types"

export const siteConfig = {
  name: "Karadeniz Ağız ve Diş Sağlığı Polikliniği",
  description: "Karadeniz Ağız ve Diş Sağlığı Polikliniği",
}

export type SiteConfig = typeof siteConfig

export const managerNavigationItems: NavigationItem[] = [
  {
    title: "Ana Sayfa",
    href: "/",
    icon: "Home",
  },
  {
    title: "Günlük Kasa",
    href: "/gunluk-kasa",
    icon: "Vault",
  },
  {
    title: "Hekimler",
    icon: "BriefcaseMedical",
    isDropdown: true,
    children: [
      {
        title: "Hekimleri Listele",
        href: "/hekim",
        icon: "UserSearch",
        description: "Hekimleri listeleyebilirsiniz.",
      },
      {
        title: "Hekim Ekle",
        icon: "UserPlus",
        href: "/hekim/ekle",
        description: "Yeni bir hekim kaydı eklemek için bu alanı kullanın.",
      },
    ],
  },
  {
    title: "Hastalar",
    icon: "Users",
    isDropdown: true,
    children: [
      {
        title: "Hastaları Listele",
        href: "/hasta",
        icon: "UserSearch",
        description: "Hastahaneye ait tüm hastaları listeleyebilirsiniz.",
      },
      {
        title: "Hasta Ekle",
        href: "/hasta/ekle",
        icon: "UserPlus",
        description: "Yeni bir hasta kaydı eklemek için bu alanı kullanın.",
      },
    ],
  },
  {
    title: "Raporlar",
    icon: "File",
    href: "/rapor",
  },
]

export const ceoNavigationItems: NavigationItem[] = [
  {
    title: "Ana Sayfa",
    href: "/ceo",
    icon: "Home",
  },
  {
    title: "Yöneticiler",
    href: "/ceo/yonetici",
    icon: "CircleUserRound",
  },
  {
    title: "Şubeler",
    href: "/ceo/sube",
    icon: "Building",
  },
]
