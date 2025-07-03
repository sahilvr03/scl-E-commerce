import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../lib/mongodb';
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

    // Fetch user’s orders
    const ordersCollection = db.collection('orders');
    const orders = await ordersCollection.find({ userId: new ObjectId(decoded.id) }).toArray();

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
    console.error('User orders fetch error:', error.message, error.stack);
    return new Response(JSON.stringify({ message: 'Internal server error', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new Response(JSON.stringify({ message: 'Unauthorized: No token provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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

    const { productId, quantity, paymentMethod, shippingDetails, status } = await req.json();

    // Validate input
    if (!productId || !quantity || !paymentMethod || !shippingDetails || !status) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), {
        status: 400,
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

    const ordersCollection = db.collection('orders');
    const order = {
      userId: new ObjectId(decoded.id),
      productId: new ObjectId(productId),
      quantity,
      paymentMethod,
      shippingDetails,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ordersCollection.insertOne(order);

    return new Response(
      JSON.stringify({
        message: 'Order placed successfully',
        orderId: result.insertedId.toString(),
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Order creation error:', error.message, error.stack);
    return new Response(JSON.stringify({ message: 'Internal server error', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}