import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://new.leopardscourier.com/web-api/trackBookedPacket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.LEOPARD_API_KEY,
      },
      body: JSON.stringify({
        apiPassword: process.env.LEOPARD_API_PASSWORD,
      }),
    });

    const data = await response.json();

    // Make sure this is an array before sending to frontend
    const parcels = Array.isArray(data.trackBookedPacketResult) ? data.trackBookedPacketResult : [];
    return NextResponse.json(parcels);
  } catch (error) {
    console.error('Leopard API error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch from Leopards' }, { status: 500 });
  }
}
