export interface NavItem {
  title: string
  href?: string
  disabled?: boolean
  external?: boolean
  icon?: string
  label?: string
  items?: NavItem[]
}

export interface NavItemWithChildren extends NavItem {
  items: NavItem[]
}

export interface DashboardConfig {
  mainNav: NavItem[]
  sidebarNav: NavItem[]
} 