// api/categories/route.js
import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const query = parentId ? { parentId: new ObjectId(parentId) } : {};
    const categories = await db.collection('categories').find(query).sort({ name: 1 }).toArray();
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
    
    // Validate required fields
    if (!data.name || typeof data.name !== 'string') {
      return new Response(JSON.stringify({ error: 'Category name is required and must be a string' }), { status: 400 });
    }

    // Validate icon field (assuming icon name for Lucide icons)
    if (data.icon && typeof data.icon !== 'string') {
      return new Response(JSON.stringify({ error: 'Icon must be a string (Lucide icon name)' }), { status: 400 });
    }

    // Validate parentId if provided
    if (data.parentId && !ObjectId.isValid(data.parentId)) {
      return new Response(JSON.stringify({ error: 'Invalid parentId format' }), { status: 400 });
    }

    // Validate description if provided
    if (data.description && typeof data.description !== 'string') {
      return new Response(JSON.stringify({ error: 'Description must be a string' }), { status: 400 });
    }

    const category = {
      ...data,
      parentId: data.parentId ? new ObjectId(data.parentId) : null,
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