'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface WithAuthOptions {
  requireEmailVerification?: boolean;
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    requireEmailVerification = false,
  } = options;

  return function WithAuth(props: P) {
    const { user, loading, isEmailVerified } = useAuth();
    const router = useRouter();

    // Mostrar loading SOLO mientras Firebase verifica el estado de auth
    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground text-center">
                Cargando...
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Si no está logueado, mostrar mensaje simple SIN redirigir
    if (!user) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle className="text-2xl">Acceso Requerido</CardTitle>
              <CardDescription>
                Debes iniciar sesión para acceder a esta página
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
                className="w-full"
                size="lg"
              >
                Iniciar Sesión
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full"
              >
                Volver al Inicio
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Si requiere email verificado y no lo está
    if (requireEmailVerification && !isEmailVerified) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
          <Card className="w-full max-w-md border-yellow-500">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
              <CardTitle className="text-2xl text-yellow-600">Email no verificado</CardTitle>
              <CardDescription>
                Debes verificar tu email para continuar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={() => router.push('/auth/verify-email')}
                className="w-full"
              >
                Verificar Email
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="w-full"
              >
                Volver al Inicio
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Usuario autenticado - renderizar componente
    return <WrappedComponent {...props} />;
  };
}

// HOCs específicos
export function withAdmin<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return withAuth(WrappedComponent, {
    requireEmailVerification: true,
  });
}

export function withEmailVerification<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return withAuth(WrappedComponent, {
    requireEmailVerification: true,
  });
}
