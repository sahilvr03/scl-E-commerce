// /api/categories
import { connectToDatabase } from '../../lib/mongodb';

export async function GET(req) {
  try {
    const { db } = await connectToDatabase();
    const categoriesCollection = db.collection('categories');
    const categories = await categoriesCollection.find({}).toArray();
    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Categories GET error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req) {
  try {
    const { db } = await connectToDatabase();
    const categoryData = await req.json();

    // Validate required fields
    if (!categoryData.name) {
      return new Response(JSON.stringify({ error: 'Category name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate icon (optional, must be a valid URL if provided)
    if (categoryData.icon && !/^https?:\/\/.*\.(?:png|jpg|jpeg|svg|gif)$/i.test(categoryData.icon)) {
      return new Response(JSON.stringify({ error: 'Invalid icon URL format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const category = {
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const categoriesCollection = db.collection('categories');
    const result = await categoriesCollection.insertOne(category);

    return new Response(
      JSON.stringify({ message: 'Category added successfully!', categoryId: result.insertedId, ...category }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Categories POST error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}