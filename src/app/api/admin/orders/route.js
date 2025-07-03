import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new Response(JSON.stringify({ message: 'Unauthorized: No token provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error('JWT verification error:', error.message, error.stack);
      return new Response(JSON.stringify({ message: 'Invalid or expired token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Connect to database
    let db;
    try {
      const connection = await connectToDatabase();
      db = connection.db;
    } catch (error) {
      console.error('Database connection error:', error.message, error.stack);
      return new Response(JSON.stringify({ message: 'Failed to connect to database' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.id) });

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (user.role !== 'admin') {
      return new Response(JSON.stringify({ message: 'Access denied: Admins only' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch all orders
    const ordersCollection = db.collection('orders');
    const orders = await ordersCollection.find({}).toArray();

    // Serialize ObjectId fields to strings
    const serializedOrders = orders.map((order) => ({
      ...order,
      _id: order._id.toString(),
      userId: order.userId.toString(),
      productId: order.productId.toString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }));

    return new Response(JSON.stringify(serializedOrders), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Admin orders fetch error:', error.message, error.stack);
    return new Response(JSON.stringify({ message: 'Internal server error', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}