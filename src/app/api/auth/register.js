// pages/api/auth/register.js (Pages Router)
// OR
// app/api/auth/register/route.js (App Router - ensure it's a server file)

import { connectToDatabase } from '../../../lib/mongodb';
import { hash } from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const { db } = await connectToDatabase();
  const usersCollection = db.collection('users');

  // Check if user already exists
  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'User with this email already exists.' });
  }

  // Hash the password
  const hashedPassword = await hash(password, 12); // 12 is a good salt rounds value

  // Insert the new user into the database
  const result = await usersCollection.insertOne({
    name,
    email,
    password: hashedPassword,
    role: 'user', // Default role for new signups
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  if (result.acknowledged) {
    return res.status(201).json({ message: 'User registered successfully!' });
  } else {
    return res.status(500).json({ message: 'Failed to register user.' });
  }
}