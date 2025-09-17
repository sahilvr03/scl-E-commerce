import { connectToDatabase } from '../../lib/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

async function authenticate(req) {
  const cookieHeader = req.headers.get('cookie') || '';
  const tokenFromCookie = cookieHeader.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  const token = req.headers.get('authorization')?.split('Bearer ')[1] || tokenFromCookie;

  if (!token) {
    console.error('Unauthorized: No token provided');
    return null; // Return null instead of throwing error to avoid popups
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
}

export async function GET(req) {
  try {
    const userId = await authenticate(req);
    if (!userId) {
      return Response.json({ items: [] });
    }

    const { db } = await connectToDatabase();
    const cartsCollection = db.collection('carts');
    const productsCollection = db.collection('products');

    const cart = await cartsCollection.findOne({ userId: new ObjectId(userId) });
    if (!cart) {
      return Response.json({ items: [] });
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

    return Response.json({ items: itemsWithDetails });
  } catch (error) {
    console.error('Cart GET error:', error.message);
    return Response.json({ items: [] });
  }
}

export async function POST(req) {
  try {
    const userId = await authenticate(req);
    if (!userId) {
      return Response.json({ items: [] });
    }

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
    console.error('Cart POST error:', error.message);
    return Response.json({ message: 'Failed to add to cart' }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const userId = await authenticate(req);
    if (!userId) {
      console.error("Cart DELETE: No authenticated user, returning empty response");
      return Response.json({ items: [] });
    }

    const { productId } = await req.json();
    if (!productId) {
      return Response.json({ message: "ProductId is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const cartsCollection = db.collection("carts");
    const productsCollection = db.collection("products");

    const cart = await cartsCollection.findOne({ userId: new ObjectId(userId) });
    if (!cart) {
      console.log(`Cart DELETE: No cart found for user ${userId}, returning empty response`);
      return Response.json({ items: [] });
    }

    // ✅ Remove only the matching item
    const updatedItems = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cartsCollection.updateOne(
      { userId: new ObjectId(userId) },
      { $set: { items: updatedItems, updatedAt: new Date() } }
    );

    // ✅ Return updated cart items with product details
    const itemsWithDetails = await Promise.all(
      updatedItems.map(async (item) => {
        const product = await productsCollection.findOne({ _id: new ObjectId(item.productId) });
        return {
          ...item,
          product: product || {
            _id: item.productId,
            title: "Unknown Product",
            price: 0,
            imageUrl: "/placeholder.jpg",
          },
        };
      })
    );

    console.log(`Item ${productId} removed successfully for user ${userId}`);
    return Response.json({ items: itemsWithDetails, message: "Item removed successfully" });
  } catch (error) {
    console.error("Cart DELETE error:", error.message);
    return Response.json({ message: "Failed to remove item", items: [] }, { status: 400 });
  }
}
