import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req, { params }) {
  try {
    const { db } = await connectToDatabase();
    const productsCollection = db.collection('products');

    const product = await productsCollection.findOne({ _id: new ObjectId(params.id) });
    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(product), { status: 200 });
  } catch (error) {
    console.error('Product GET error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch product' }), { status: 500 });
  }
}