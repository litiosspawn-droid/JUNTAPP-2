'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { geohashForLocation } from 'geofire-common'; // para generar geohash
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUpload from '@/components/events/ImageUpload';

export default function CreateEventPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [flyerUrl, setFlyerUrl] = useState('');
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

      // 4. Guardar en Firestore
      await addDoc(collection(db, 'events'), {
        title: formData.title,
        flyerUrl,
        category: formData.category,
        date: dateTime,
        address: formData.address,
        location: new GeoPoint(coords.lat, coords.lng), // GeoPoint
        geohash, // string para búsquedas con geofirestore
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        attendees: [], // inicialmente vacío
        attendeesCount: 0,
      });

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
              {flyerUrl && <img src={flyerUrl} alt="flyer" className="mt-2 h-32 object-cover" />}
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
