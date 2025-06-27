import { connectToDatabase } from '../../lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const categories = await db.collection('categories').find({}).toArray();
    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
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
    const category = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection('categories').insertOne(category);
    return new Response(JSON.stringify({ ...category, _id: result.insertedId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}