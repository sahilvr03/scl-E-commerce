// api/login.js
import { connectToDatabase } from '../../../lib/mongodb';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ message: 'Please enter both email and password.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return new Response(JSON.stringify({ message: 'No user found with this email.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const checkPassword = await compare(password, user.password);
    if (!checkPassword) {
      return new Response(JSON.stringify({ message: 'Incorrect password.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const response = new Response(
      JSON.stringify({ message: 'Login successful!', user: { id: user._id.toString(), email: user.email, role: user.role } }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
    response.headers.set(
      'Set-Cookie',
      `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    );
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ message: 'An unexpected error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}