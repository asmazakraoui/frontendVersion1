"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Building, Home, Info, Users } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

interface MainNavProps {
  items: NavItem[]
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href ? "text-primary" : "text-muted-foreground",
          )}
        >
          <span className="mr-2">{item.icon}</span>
          {item.title}
        </Link>
      ))}
    </nav>
  )
}

export function getAdminNavItems(): NavItem[] {
  return [
    {
      title: "Accueil",
      href: "/admin/dashboard",
      icon: <Home className="h-4 w-4" />,
    },
    {
      title: "Sociétés",
      href: "/admin/companies",
      icon: <Building className="h-4 w-4" />,
    },
    {
      title: "Filiales",
      href: "/admin/subsidiaries",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "À propos",
      href: "/admin/about",
      icon: <Info className="h-4 w-4" />,
    },
  ]
}

export function getEmployeeNavItems(): NavItem[] {
  return [
    {
      title: "Accueil",
      href: "/employee/dashboard",
      icon: <Home className="h-4 w-4" />,
    },
    {
      title: "Mes accès",
      href: "/employee/access",
      icon: <Building className="h-4 w-4" />,
    },
    {
      title: "À propos",
      href: "/employee/about",
      icon: <Info className="h-4 w-4" />,
    },
  ]
}

