// ✅ FILE: app/api/cart/route.js

import { connectToDatabase } from '../../lib/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

async function authenticate(req) {
  const cookieHeader = req.headers.get('cookie') || '';
  const tokenFromCookie = cookieHeader.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  const token = req.headers.get('authorization')?.split('Bearer ')[1] || tokenFromCookie;

  if (!token) throw new Error('Not authenticated');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export async function GET(req) {
  try {
    const userId = await authenticate(req);
    const { db } = await connectToDatabase();
    const cartsCollection = db.collection('carts');
    const productsCollection = db.collection('products');

    const cart = await cartsCollection.findOne({ userId: new ObjectId(userId) });
    if (!cart) {
      return Response.json({ items: [], message: 'Cart is empty' });
    }

    const itemsWithDetails = await Promise.all(
      cart.items.map(async (item) => {
        const product = await productsCollection.findOne({ _id: new ObjectId(item.productId) });
        return {
          ...item,
          product: product || { _id: item.productId, title: 'Unknown Product', price: 0, imageUrl: '/placeholder.jpg' },
        };
      })
    );

    return Response.json({ items: itemsWithDetails, message: 'Cart retrieved successfully' });
  } catch (error) {
    console.error('Cart GET error:', error);
    return new Response(JSON.stringify({ message: error.message || 'Failed to fetch cart' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req) {
  try {
    const userId = await authenticate(req);
    const { productId, quantity } = await req.json();

    if (!productId || !quantity || quantity < 1) {
      return Response.json({ message: 'Invalid product or quantity' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const cartsCollection = db.collection('carts');
    const productsCollection = db.collection('products');

    const product = await productsCollection.findOne({ _id: new ObjectId(productId) });
    if (!product) {
      return Response.json({ message: 'Product not found' }, { status: 404 });
    }

    const cart = await cartsCollection.findOne({ userId: new ObjectId(userId) });
    if (cart) {
      const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId: new ObjectId(productId), quantity });
      }
      await cartsCollection.updateOne(
        { userId: new ObjectId(userId) },
        { $set: { items: cart.items, updatedAt: new Date() } }
      );
    } else {
      await cartsCollection.insertOne({
        userId: new ObjectId(userId),
        items: [{ productId: new ObjectId(productId), quantity }],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return Response.json({ message: 'Added to cart successfully' });
  } catch (error) {
    console.error('Cart POST error:', error);
    return new Response(JSON.stringify({ message: error.message || 'Failed to add to cart' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(req) {
  try {
    const userId = await authenticate(req);
    const { productId } = await req.json();

    if (!productId) {
      return Response.json({ message: 'Missing productId' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const cartsCollection = db.collection('carts');

    const cart = await cartsCollection.findOne({ userId: new ObjectId(userId) });
    if (!cart) return Response.json({ items: [], message: 'Cart is empty' });

    const updatedItems = cart.items.filter((item) => item.productId.toString() !== productId);
    await cartsCollection.updateOne(
      { userId: new ObjectId(userId) },
      { $set: { items: updatedItems, updatedAt: new Date() } }
    );

    return Response.json({ items: updatedItems, message: 'Item removed successfully' });
  } catch (error) {
    console.error('Cart DELETE error:', error);
    return new Response(JSON.stringify({ message: error.message || 'Failed to remove item' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
