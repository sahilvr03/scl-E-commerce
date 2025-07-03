// api/signup.js
import { connectToDatabase } from '../../../lib/mongodb';
import { hash } from 'bcryptjs';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ message: 'User with this email already exists.' }), { status: 409 });
    }

    const hashedPassword = await hash(password, 12);

    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      role: 'user', // Default role
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return new Response(JSON.stringify({ message: 'User registered successfully!' }), { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ message: 'Failed to register user.' }), { status: 500 });
  }
}