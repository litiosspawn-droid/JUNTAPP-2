'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { withAuth } from '@/hoc/withAuth';
import { db } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { geohashForLocation } from 'geofire-common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import ImageUpload from '@/components/events/ImageUpload';
import { RecurrenceConfigForm, type RecurrenceConfig } from '@/components/create-event/recurrence-config';
import { CancellationPolicyForm, type CancellationPolicy } from '@/components/create-event/cancellation-policy';
import { createRecurringEvents } from '@/lib/firebase/events';

function CreateEventPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [flyerUrl, setFlyerUrl] = useState('');
  const [recurrenceConfig, setRecurrenceConfig] = useState<RecurrenceConfig>({
    isRecurring: false,
    pattern: 'none',
  });
  const [cancellationPolicy, setCancellationPolicy] = useState<{
    policy: CancellationPolicy;
    deadline?: string;
  }>({
    policy: 'moderate',
  });
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    date: '',
    time: '',
    address: '',
  });
  const [error, setError] = useState('');

  const handleAddressGeocode = async () => {
    if (!formData.address) return;
    const res = await fetch(`/api/geocode?address=${encodeURIComponent(formData.address)}`);
    const data = await res.json();
    if (data.error) {
      setError(data.error);
      return null;
    }
    return { lat: data.lat, lng: data.lon };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return router.push('/auth/login');
    setLoading(true);
    setError('');

    try {
      // 1. Geocodificar dirección
      const coords = await handleAddressGeocode();
      if (!coords) return;

      // 2. Combinar fecha y hora en un objeto Date
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      // 3. Calcular geohash
      const geohash = geohashForLocation([coords.lat, coords.lng]);

      // 4. Crear evento padre
      const eventToSave = {
        title: formData.title,
        flyerUrl,
        category: formData.category,
        date: formData.date,
        time: formData.time,
        address: formData.address,
        lat: coords.lat,
        lng: coords.lng,
        location: new GeoPoint(coords.lat, coords.lng),
        geohash,
        createdBy: user.uid,
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        attendees: 0,
        attendeesCount: 0,
        isRecurring: recurrenceConfig.isRecurring && recurrenceConfig.pattern !== 'none',
        recurrencePattern: recurrenceConfig.pattern !== 'none' ? recurrenceConfig.pattern : undefined,
        recurrenceEndDate: recurrenceConfig.endDate,
        recurrenceCount: recurrenceConfig.count,
        cancellationPolicy: cancellationPolicy.policy,
        cancellationDeadline: cancellationPolicy.policy === 'custom' ? cancellationPolicy.deadline : undefined,
      };

      // 5. Guardar evento padre
      const docRef = await addDoc(collection(db, 'events'), eventToSave);

      // 6. Si es recurrente, crear instancias
      if (recurrenceConfig.isRecurring && recurrenceConfig.pattern !== 'none') {
        const parentEvent = {
          id: docRef.id,
          ...eventToSave,
        };

        await createRecurringEvents(parentEvent, {
          pattern: recurrenceConfig.pattern as any,
          endDate: recurrenceConfig.endDate,
          count: recurrenceConfig.count,
        });
      }

      router.push('/'); // redirige a exploración
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Crear nuevo evento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Flyer (imagen)</Label>
              <ImageUpload onUpload={(url: string) => setFlyerUrl(url)} />
              {flyerUrl && (
                <div className="relative mt-2 h-32 w-full overflow-hidden rounded-lg">
                  <Image
                    src={flyerUrl}
                    alt="flyer del evento"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Categoría</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Hora</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Dirección</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ej: Plaza Mayor, Madrid"
                required
              />
              <p className="text-sm text-muted-foreground">Se geocodificará automáticamente al guardar</p>
            </div>

            {/* Configuración de recurrencia */}
            <RecurrenceConfigForm
              value={recurrenceConfig}
              onChange={setRecurrenceConfig}
            />

            {/* Política de cancelación */}
            <CancellationPolicyForm
              value={cancellationPolicy}
              onChange={setCancellationPolicy}
            />

            {error && <p className="text-red-500">{error}</p>}

            <Button type="submit" disabled={loading || !flyerUrl}>
              {loading ? 'Creando...' : 'Crear evento'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Proteger ruta: requiere autenticación y email verificado
export default withAuth(CreateEventPageContent, {
  requireEmailVerification: true,
});
