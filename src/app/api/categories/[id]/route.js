import { connectToDatabase } from '../../../lib/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

async function authenticate(req) {
  const token = req.headers.get('authorization')?.split('Bearer ')[1];
  if (!token) {
    throw new Error('Not authenticated');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export async function GET(req) {
  try {
    const { db } = await connectToDatabase();
    const categoriesCollection = db.collection('categories');

    const url = new URL(req.url);
    const categoryId = url.pathname.split('/').pop();

    if (categoryId && categoryId !== 'categories') {
      const category = await categoriesCollection.findOne({ _id: new ObjectId(categoryId) });
      if (!category) {
        return new Response(JSON.stringify({ error: 'Category not found' }), { status: 404 });
      }
      return new Response(JSON.stringify(category), { status: 200 });
    }

    const categories = await categoriesCollection.find({}).toArray();
    return new Response(JSON.stringify(categories), { status: 200 });
  } catch (error) {
    console.error('Categories GET error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = await authenticate(req);
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
    }

    const categoryData = await req.json();
    const categoriesCollection = db.collection('categories');

    const result = await categoriesCollection.insertOne({
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return new Response(JSON.stringify({ message: 'Category added successfully!', categoryId: result.insertedId }), { status: 201 });
  } catch (error) {
    console.error('Categories POST error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to add category' }), { status: 400 });
  }
}