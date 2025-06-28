import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const product = await db.collection('products').findOne({ _id: new ObjectId(params.id) });
    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(product), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching product:', error);
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
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
      discount: data.discount ? Number(data.discount) : undefined,
      rating: data.rating ? Number(data.rating) : 0,
      reviews: data.reviews ? Number(data.reviews) : 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validate imageUrl
    if (!product.imageUrl || !product.imageUrl.startsWith('https://res.cloudinary.com')) {
      return new Response(JSON.stringify({ error: 'Invalid or missing Cloudinary image URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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