import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const apiKey = process.env.LOCATIONIQ_API_KEY;

  if (!address) {
    return NextResponse.json({ error: 'Dirección requerida' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(
        address
      )}&format=json&limit=1`
    );
    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    if (data.length === 0) {
      return NextResponse.json({ error: 'No se encontraron resultados' }, { status: 404 });
    }

    const { lat, lon, display_name } = data[0];
    return NextResponse.json({ lat: parseFloat(lat), lon: parseFloat(lon), display_name });
  } catch (error) {
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
