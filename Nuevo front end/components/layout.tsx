"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, User, Plus, MapPin, Home, Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function Header() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            JuntApp
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/">
            <Button
              variant={pathname === "/" ? "secondary" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Inicio
            </Button>
          </Link>
          <Link href="/mapa">
            <Button
              variant={pathname === "/mapa" ? "secondary" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <Map className="h-4 w-4" />
              Mapa
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className={`hidden items-center md:flex ${searchOpen ? "w-64" : "w-48"}`}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos..."
                className="h-9 pl-9 text-sm"
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          </div>

          <Link href="/crear">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Crear evento</span>
            </Button>
          </Link>

          <Link href="/perfil">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">Perfil</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-card py-2 md:hidden">
        <Link href="/" className="flex flex-col items-center gap-0.5">
          <Home className={`h-5 w-5 ${pathname === "/" ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-xs ${pathname === "/" ? "text-primary font-medium" : "text-muted-foreground"}`}>Inicio</span>
        </Link>
        <Link href="/mapa" className="flex flex-col items-center gap-0.5">
          <Map className={`h-5 w-5 ${pathname === "/mapa" ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-xs ${pathname === "/mapa" ? "text-primary font-medium" : "text-muted-foreground"}`}>Mapa</span>
        </Link>
        <Link href="/crear" className="flex flex-col items-center gap-0.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Plus className="h-5 w-5 text-primary-foreground" />
          </div>
        </Link>
        <Link href="/perfil" className="flex flex-col items-center gap-0.5">
          <User className={`h-5 w-5 ${pathname === "/perfil" ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-xs ${pathname === "/perfil" ? "text-primary font-medium" : "text-muted-foreground"}`}>Perfil</span>
        </Link>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card pb-20 md:pb-0">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <MapPin className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">JuntApp</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Descubre eventos locales cerca tuyo.
        </p>
        <div className="flex gap-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Inicio
          </Link>
          <Link href="/mapa" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Mapa
          </Link>
          <Link href="/crear" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Crear
          </Link>
        </div>
      </div>
    </footer>
  )
}
