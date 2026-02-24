"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, User, Plus, MapPin, Home, Map, LogOut, UserIcon, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useAuth } from '@/contexts/AuthContext'
import { signInWithGoogle, logoutUser } from '@/lib/firebase/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const { user, loading } = useAuth()

  const handleLogin = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Error logging in:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

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
          <ThemeToggle />

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

          {user ? (
            <>
              <Link href="/crear">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Crear evento</span>
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'Usuario'} />
                      <AvatarFallback className="text-xs">
                        {user.displayName?.[0] || user.email?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.displayName || 'Usuario'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.uid}`} className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      Mi perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/edit`} className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Configuración
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/crear">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Crear evento</span>
                </Button>
              </Link>
              <Button onClick={handleLogin} size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </Button>
            </>
          )}
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
        {user ? (
          <Link href={`/profile/${user.uid}`} className="flex flex-col items-center gap-0.5">
            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs text-primary-foreground">
                {user.displayName?.[0] || user.email?.[0] || 'U'}
              </span>
            </div>
            <span className="text-xs text-primary font-medium">Perfil</span>
          </Link>
        ) : (
          <div className="flex flex-col items-center gap-0.5">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Login</span>
          </div>
        )}
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
          <Link href="/events/create" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Crear
          </Link>
        </div>
      </div>
    </footer>
  )
}
