// api/products/route.js
import { connectToDatabase } from '../../lib/mongodb';

export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    const products = await db.collection('products').find(query).toArray();
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
    
    // Validate type field
    if (data.type && !['forYou', 'recommended', 'flashSale'].includes(data.type)) {
      return new Response(JSON.stringify({ error: 'Invalid product type' }), { status: 400 });
    }

    // Validate endDate for flashSale products
    if (data.type === 'flashSale' && data.endDate) {
      const isValidDate = !isNaN(Date.parse(data.endDate));
      if (!isValidDate) {
        return new Response(JSON.stringify({ error: 'Invalid endDate format' }), { status: 400 });
      }
    }

    // Validate images and colors
    if (data.images && !Array.isArray(data.images)) {
      return new Response(JSON.stringify({ error: 'Images must be an array' }), { status: 400 });
    }
    if (data.colors && !Array.isArray(data.colors)) {
      return new Response(JSON.stringify({ error: 'Colors must be an array' }), { status: 400 });
    }

    // Optional: Validate category if present
    if (data.category && typeof data.category !== 'string') {
      return new Response(JSON.stringify({ error: 'Category must be a string' }), { status: 400 });
    }

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