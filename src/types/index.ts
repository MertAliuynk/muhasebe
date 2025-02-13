export interface NavigationItem {
  title: string
  href?: string
  icon?: string
  description?: string
  isDropdown?: boolean
  children?: NavigationItem[]
}
