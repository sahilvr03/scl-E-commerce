
import { connectToDatabase } from '../../lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { db } = await connectToDatabase();
    const cartCollection = db.collection('carts');
    const productsCollection = db.collection('products');

    const cart = await cartCollection.findOne({ userId });
    if (!cart) {
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const itemsWithDetails = await Promise.all(
      cart.items.map(async (item) => {
        const product = await productsCollection.findOne({ _id: item.productId });
        return { ...item, product: product || {} };
      })
    );

    return new Response(JSON.stringify({ ...cart, items: itemsWithDetails }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const { userId, productId, quantity } = await request.json();

    if (!userId || !productId || !quantity) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cartCollection = db.collection('carts');
    const productsCollection = db.collection('products');

    const cart = await cartCollection.findOne({ userId });

    if (cart) {
      const existingItem = cart.items.find(item => item.productId === productId);
      if (existingItem) {
        await cartCollection.updateOne(
          { userId, 'items.productId': productId },
          { $set: { 'items.$.quantity': existingItem.quantity + quantity, updatedAt: new Date() } }
        );
      } else {
        await cartCollection.updateOne(
          { userId },
          { $push: { items: { productId, quantity } }, $set: { updatedAt: new Date() } }
        );
      }
    } else {
      await cartCollection.insertOne({
        userId,
        items: [{ productId, quantity }],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const updatedCart = await cartCollection.findOne({ userId });
    const itemsWithDetails = await Promise.all(
      updatedCart.items.map(async (item) => {
        const product = await productsCollection.findOne({ _id: item.productId });
        return { ...item, product: product || {} };
      })
    );

    return new Response(JSON.stringify({ ...updatedCart, items: itemsWithDetails }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request) {
  try {
    const { db } = await connectToDatabase();
    const { userId, productId, quantity } = await request.json();

    if (!userId || !productId || !quantity) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cartCollection = db.collection('carts');
    const productsCollection = db.collection('products');

    const cart = await cartCollection.findOne({ userId });
    if (!cart) {
      return new Response(JSON.stringify({ error: 'Cart not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await cartCollection.updateOne(
      { userId, 'items.productId': productId },
      { $set: { 'items.$.quantity': quantity, updatedAt: new Date() } }
    );

    const updatedCart = await cartCollection.findOne({ userId });
    const itemsWithDetails = await Promise.all(
      updatedCart.items.map(async (item) => {
        const product = await productsCollection.findOne({ _id: item.productId });
        return { ...item, product: product || {} };
      })
    );

    return new Response(JSON.stringify({ ...updatedCart, items: itemsWithDetails }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request) {
  try {
    const { db } = await connectToDatabase();
    const { userId, productId } = await request.json();

    if (!userId || !productId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cartCollection = db.collection('carts');
    const productsCollection = db.collection('products');

    const cart = await cartCollection.findOne({ userId });
    if (!cart) {
      return new Response(JSON.stringify({ error: 'Cart not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await cartCollection.updateOne(
      { userId },
      { $pull: { items: { productId } }, $set: { updatedAt: new Date() } }
    );

    const updatedCart = await cartCollection.findOne({ userId });
    const itemsWithDetails = updatedCart
      ? await Promise.all(
          updatedCart.items.map(async (item) => {
            const product = await productsCollection.findOne({ _id: item.productId });
            return { ...item, product: product || {} };
          })
        )
      : [];

    return new Response(JSON.stringify({ ...updatedCart, items: itemsWithDetails }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
