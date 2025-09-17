// api/categories/[id]/route.js
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req, { params }) {
  try {
    const { db } = await connectToDatabase();
    const category = await db.collection('categories').findOne({ _id: new ObjectId(params.id) });
    if (!category) {
      return new Response(JSON.stringify({ error: 'Category not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(category), { status: 200 });
  } catch (error) {
    console.error('Category GET error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch category' }), { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();
    const { _id, ...categoryData } = data;

    // Validate required fields
    if (categoryData.name && typeof categoryData.name !== 'string') {
      return new Response(JSON.stringify({ error: 'Category name must be a string' }), { status: 400 });
    }

    // Validate icon field
    if (categoryData.icon && typeof categoryData.icon !== 'string') {
      return new Response(JSON.stringify({ error: 'Icon must be a string' }), { status: 400 });
    }

    // Validate parentId if provided
    if (categoryData.parentId && !ObjectId.isValid(categoryData.parentId)) {
      return new Response(JSON.stringify({ error: 'Invalid parentId format' }), { status: 400 });
    }

    // Validate description if provided
    if (categoryData.description && typeof categoryData.description !== 'string') {
      return new Response(JSON.stringify({ error: 'Description must be a string' }), { status: 400 });
    }

    const result = await db.collection('categories').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { ...categoryData, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: 'Category not found' }), { status: 404 });
    }

    const updatedCategory = await db.collection('categories').findOne({ _id: new ObjectId(params.id) });
    return new Response(JSON.stringify(updatedCategory), { status: 200 });
  } catch (error) {
    console.error('Error updating category:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    
    // First, check if category has subcategories
    const subcategories = await db.collection('categories').find({ parentId: new ObjectId(params.id) }).toArray();
    if (subcategories.length > 0) {
      return new Response(JSON.stringify({ error: 'Cannot delete category with subcategories. Delete subcategories first.' }), { status: 400 });
    }

    // Check if products are assigned to this category
    const productsInCategory = await db.collection('products').find({ category: params.id }).toArray();
    if (productsInCategory.length > 0) {
      return new Response(JSON.stringify({ error: 'Cannot delete category with assigned products. Reassign products first.' }), { status: 400 });
    }

    const result = await db.collection('categories').deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ error: 'Category not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Category deleted successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error deleting category:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}