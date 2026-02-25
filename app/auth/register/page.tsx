'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Mail } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password);
      setRegistered(true);
      // Redirect to verify email page after 2 seconds
      setTimeout(() => {
        router.push('/auth/verify-email');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al registrar');
    } finally {
      setIsLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Card className="w-[400px]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">¡Registro exitoso!</CardTitle>
            <CardDescription>
              Te hemos enviado un email de verificación
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Revisa tu bandeja de entrada y haz click en el enlace de verificación.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirigiendo...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription>
            Únete a JuntApp y descubre eventos en tu zona
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar contraseña
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="p-3 text-sm text-white bg-red-500 rounded-lg">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>

          <p className="text-center text-sm mt-6 text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Al registrarte, aceptas nuestros Términos de Servicio y Política de Privacidad.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
