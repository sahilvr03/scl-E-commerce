import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(req, { params }) {
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

    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ message: 'Access denied: Admins only' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update order status
    const { status } = await req.json();
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ message: 'Invalid status' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ordersCollection = db.collection('orders');
    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ message: 'Order not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Order status updated successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Order status update error:', error.message, error.stack);
    return new Response(JSON.stringify({ message: 'Internal server error', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}