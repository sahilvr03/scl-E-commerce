// pages/api/auth/[...nextauth].js (Pages Router)
// OR
// app/api/auth/[...nextauth]/route.js (App Router - ensure it's a server file)

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '../../../lib/mongodb';
import { compare } from 'bcryptjs';
import { ObjectId } from 'mongodb'; // Import ObjectId

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          throw new Error('Please enter both email and password.');
        }

        const { db } = await connectToDatabase();
        const usersCollection = db.collection('users');

        // Find user by email
        const user = await usersCollection.findOne({ email: credentials.email });

        if (!user) {
          throw new Error('No user found with this email.');
        }

        // Compare provided password with hashed password in database
        const checkPassword = await compare(credentials.password, user.password);

        if (!checkPassword) {
          throw new Error('Incorrect password.');
        }

        // If credentials are valid, return the user object
        // This object will be available in session.user
        return {
          id: user._id.toString(), // Important: convert ObjectId to string
          email: user.email,
          name: user.name, // Assuming 'name' field exists
          role: user.role, // Pass the user's role
        };
      }
    })
  ],
  callbacks: {
    // Session callback: This runs whenever a session is checked.
    // We add user ID and role to the session.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    }
  },
  session: {
    strategy: 'jwt', // Use JWT for session management
  },
  pages: {
    signIn: '/login', // Redirect unauthenticated users to your custom login page
    // You can also define error: '/auth/error', signOut: '/auth/signout' etc.
  },
  secret: process.env.NEXTAUTH_SECRET, // IMPORTANT: Set this in your .env.local
};

// For Pages Router:
export default NextAuth(authOptions);

// For App Router:
// If using App Router, create a separate file like `auth.js` for `authOptions`
// then in `app/api/auth/[...nextauth]/route.js`:
// import { authOptions } from '@/lib/auth'; // assuming auth.js is in lib folder
// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };