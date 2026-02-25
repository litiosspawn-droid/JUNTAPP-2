'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const { user, isEmailVerified, sendVerificationEmail, refreshUser } = useAuth();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Redirect if not logged in or email already verified
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (isEmailVerified) {
      router.push('/');
      return;
    }
  }, [user, isEmailVerified, router]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-refresh user status every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUser();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshUser]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;

    setSending(true);
    setError('');

    try {
      await sendVerificationEmail();
      setSent(true);
      setCountdown(30); // 30 seconds cooldown
    } catch (err: any) {
      setError(err.message || 'Error al enviar email de verificación');
    } finally {
      setSending(false);
    }
  };

  const handleCheckStatus = async () => {
    await refreshUser();
  };

  if (!user) {
    return null;
  }

  if (isEmailVerified) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Card className="w-[450px]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verifica tu email</CardTitle>
          <CardDescription>
            Te hemos enviado un email de verificación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Hemos enviado un email de verificación a{' '}
              <span className="font-medium">{user.email}</span>.
              Por favor, revisa tu bandeja de entrada y haz click en el enlace de verificación.
            </AlertDescription>
          </Alert>

          {sent && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ¡Email reenviado! Revisa tu bandeja de entrada.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="bg-red-50 text-red-800 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Check if email is verified */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                ¿Ya verificaste tu email?
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCheckStatus}
                disabled={sending}
              >
                Verificar ahora
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={handleResendEmail}
              disabled={sending || countdown > 0}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : countdown > 0 ? (
                `Reenviar en ${countdown}s`
              ) : (
                'Reenviar email de verificación'
              )}
            </Button>

            <Link href="/" className="block">
              <Button variant="ghost" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>¿No recibiste el email?</p>
            <p>Revisa tu carpeta de spam o correo no deseado.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
