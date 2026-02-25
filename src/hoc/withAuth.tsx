'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface WithAuthOptions {
  requireEmailVerification?: boolean;
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { requireEmailVerification = false } = options;

  return function WithAuth(props: P) {
    const { user, loading, isEmailVerified } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!loading && !user) {
        // Guardar la URL actual para redirigir después del login
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }, [user, loading, router, pathname]);

    useEffect(() => {
      if (!loading && user && requireEmailVerification && !isEmailVerified) {
        router.push('/auth/verify-email');
      }
    }, [user, loading, isEmailVerified, requireEmailVerification, router]);

    // Mostrar loading mientras verifica autenticación
    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      );
    }

    // Si no está logueado, no renderizar (será redirigido)
    if (!user) {
      return null;
    }

    // Si requiere email verificado y no lo está, no renderizar (será redirigido)
    if (requireEmailVerification && !isEmailVerified) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
