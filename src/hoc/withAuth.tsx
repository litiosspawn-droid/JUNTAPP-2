'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyPreset } from '@/components/ui/empty';

interface WithAuthOptions {
  requireEmailVerification?: boolean;
  allowedRoles?: ('user' | 'admin' | 'moderator')[];
  redirectUnauthenticated?: string;
  redirectUnauthorized?: string;
  redirectUnverified?: string;
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    requireEmailVerification = false,
    allowedRoles = ['user', 'admin', 'moderator'],
    redirectUnauthenticated = '/auth/login',
    redirectUnauthorized = '/',
    redirectUnverified = '/auth/verify-email',
  } = options;

  return function WithAuth(props: P) {
    const { user, loading, isEmailVerified } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [userRole, setUserRole] = useState<string>('user'); // Default a 'user'
    const [roleLoading, setRoleLoading] = useState(true);
    const [hasRedirected, setHasRedirected] = useState(false);

    // Obtener rol del usuario (solo una vez)
    useEffect(() => {
      if (!user) {
        setRoleLoading(false);
        return;
      }

      // Si ya tenemos el rol, no hacer nada
      if (userRole !== 'user') {
        setRoleLoading(false);
        return;
      }

      const getUserRole = async () => {
        try {
          // Timeout de 3 segundos para evitar bloqueos
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const response = await fetch(`/api/user/${user.uid}/role`, {
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            setUserRole(data.role || 'user');
          } else {
            // Si falla, asumir rol 'user'
            setUserRole('user');
          }
        } catch {
          // Si falla, asumir rol 'user'
          setUserRole('user');
        } finally {
          setRoleLoading(false);
        }
      };

      getUserRole();
    }, [user, userRole]);

    // Redirigir si no está autenticado (solo una vez)
    useEffect(() => {
      if (hasRedirected) return;
      
      if (!loading && !user && !roleLoading) {
        setHasRedirected(true);
        const redirectUrl = `${redirectUnauthenticated}?redirect=${encodeURIComponent(pathname)}`;
        router.push(redirectUrl);
      }
    }, [user, loading, router, pathname, redirectUnauthenticated, roleLoading, hasRedirected]);

    // Redirigir si requiere email verificado y no lo está (solo una vez)
    useEffect(() => {
      if (hasRedirected) return;
      
      if (!loading && user && requireEmailVerification && !isEmailVerified && !roleLoading) {
        setHasRedirected(true);
        router.push(redirectUnverified);
      }
    }, [user, loading, isEmailVerified, requireEmailVerification, router, redirectUnverified, roleLoading, hasRedirected]);

    // Mostrar loading mientras verifica autenticación y rol
    // Pero con timeout máximo de 5 segundos
    const [showLoading, setShowLoading] = useState(true);
    
    useEffect(() => {
      const timeout = setTimeout(() => {
        setShowLoading(false);
      }, 5000);
      
      if (!loading && !roleLoading) {
        setShowLoading(false);
      }
      
      return () => clearTimeout(timeout);
    }, [loading, roleLoading]);

    if (showLoading && (loading || roleLoading)) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground text-center">
                {loading ? 'Cargando...' : 'Verificando permisos...'}
              </p>
              {loading && (
                <p className="text-xs text-muted-foreground mt-2">
                  Si esto tarda más de lo normal, recargá la página
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    // Si no está logueado, mostrar pantalla de acceso denegado
    if (!user) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
          <EmptyPreset
            preset="no-data"
            title="Acceso requerido"
            description="Debes iniciar sesión para acceder a esta página."
            actionLabel="Iniciar Sesión"
            onAction={() => router.push(`${redirectUnauthenticated}?redirect=${encodeURIComponent(pathname)}`)}
            className="max-w-md"
          />
        </div>
      );
    }

    // Si requiere email verificado y no lo está
    if (requireEmailVerification && !isEmailVerified) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
          <Card className="w-full max-w-md border-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="h-6 w-6" />
                Email no verificado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Debes verificar tu email para acceder a esta página.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(redirectUnverified)}
                >
                  Verificar Email
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/')}
                >
                  Volver al Inicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

// HOCs específicos para diferentes casos de uso
export function withAdmin<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return withAuth(WrappedComponent, {
    requireEmailVerification: true,
    allowedRoles: ['admin'],
    redirectUnauthorized: '/',
  });
}

export function withEmailVerification<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return withAuth(WrappedComponent, {
    requireEmailVerification: true,
  });
}

export function withModerator<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return withAuth(WrappedComponent, {
    requireEmailVerification: true,
    allowedRoles: ['moderator', 'admin'],
  });
}

// Componente para verificar permisos condicionalmente
export function AuthGuard({
  children,
  requireEmailVerification = false,
  allowedRoles,
  fallback,
}: {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
  allowedRoles?: ('user' | 'admin' | 'moderator')[];
  fallback?: React.ReactNode;
}) {
  const { user, loading, isEmailVerified } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const getUserRole = async () => {
        try {
          const response = await fetch(`/api/user/${user.uid}/role`)
          if (response.ok) {
            const data = await response.json()
            setUserRole(data.role)
          }
        } catch {
          setUserRole('user')
        } finally {
          setRoleLoading(false)
        }
      }
      getUserRole()
    } else {
      setRoleLoading(false)
    }
  }, [user]);

  if (loading || roleLoading) {
    return fallback || (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireEmailVerification && !isEmailVerified) {
    return null;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole as any)) {
    return null;
  }

  return <>{children}</>;
}
