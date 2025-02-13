import { type Route } from "next"

const BREADCRUMB_LABELS: Record<string, string> = {
  hekim: "Hekimler",
  ekle: "Yeni Ekle",
  hasta: "Hastalar",
}

interface BreadcrumbItem {
  label: string
  href?: Route
}

export function getBreadcrumb(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split("/").filter(Boolean)

  return paths.map((path, index) => {
    const href = `/${paths.slice(0, index + 1).join("/")}` as Route
    const label =
      BREADCRUMB_LABELS[path] ?? path.charAt(0).toUpperCase() + path.slice(1)

    return {
      label: label.replace(/-/g, " "),
      href: index === paths.length - 1 ? undefined : href,
    }
  })
}
