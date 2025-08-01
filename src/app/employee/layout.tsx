"use client"

import type React from "react"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Separator } from "@/components/ui/separator"
import { Building, ChevronDown, Home, Info } from "lucide-react"
import Link from "next/link"

export default function EmployeeLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/employee/dashboard" className="flex items-center gap-2">
              <Building className="h-6 w-6" />
              <h1 className="text-xl font-bold tracking-tight">CONTRÔLE D'ACCÈS</h1>
            </Link>
            <MainNav items={[
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
            ]} />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Utilisateur : Jean Dupont</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Préférences</span>
              <ChevronDown className="h-4 w-4" />
            </div>
            <UserNav user={{ name: "Jean Dupont", email: "jean.dupont@example.com", role: "Employé" }} />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
