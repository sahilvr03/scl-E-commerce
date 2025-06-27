import { connectToDatabase } from '../../lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const products = await db.collection('products').find({}).toArray();
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();
    const product = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection('products').insertOne(product);
    return new Response(JSON.stringify({ ...product, _id: result.insertedId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}