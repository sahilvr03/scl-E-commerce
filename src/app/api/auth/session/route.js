// /api/session/route.js
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new Response(JSON.stringify({ session: null, message: 'No session found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error('JWT verification error:', error);
      return new Response(JSON.stringify({ session: null, message: 'Invalid or expired token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.id) });

    if (!user) {
      return new Response(JSON.stringify({ session: null, message: 'User not found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        session: {
          user: {
            id: user._id.toString(),
            name: user.name,  // Add this line
            email: user.email,
            role: user.role,
          },
        },
        message: 'Session retrieved successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Session endpoint error:', error);
    return new Response(JSON.stringify({ session: null, message: 'An unexpected error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}