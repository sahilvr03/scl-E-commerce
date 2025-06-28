import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb'; // Import ObjectId for database operations

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // Get userId from query parameters

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { db } = await connectToDatabase();
    const cartCollection = db.collection('carts');
    const productsCollection = db.collection('products');

    // --- DATA FETCHING ---
    // Fetch the cart document for the given userId
    const cart = await cartCollection.findOne({ userId });

    if (!cart) {
      // If no cart found for the user, return an empty items array
      // Expected Response Payload (JSON): { "items": [] }
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- DATA FETCHING (Joining Product Details) ---
    // For each item in the cart, fetch its full product details from the 'products' collection.
    // This enriches the cart items with displayable information like title, price, imageUrl.
    const itemsWithDetails = await Promise.all(
      cart.items.map(async (item) => {
        // Ensure productId is treated as an ObjectId for database query
        const product = await productsCollection.findOne({ _id: new ObjectId(item.productId) });
        return { ...item, product: product || {} }; // Attach product object, or empty object if not found
      })
    );

    // Expected Response Payload (JSON):
    // {
    //   "_id": "...",
    //   "userId": "mock-user-id-123",
    //   "items": [
    //     {
    //       "productId": "65a123456789abcdef0123456",
    //       "quantity": 2,
    //       "product": { // Full product details embedded here
    //         "_id": "65a123456789abcdef0123456",
    //         "title": "Product A",
    //         "price": 29.99,
    //         "imageUrl": "https://res.cloudinary.com/...",
    //         "sku": "SKU001",
    //         "brand": "BrandX",
    //         "category": "Electronics",
    //         // ...other product fields
    //       }
    //     },
    //     // ...more cart items
    //   ],
    //   "createdAt": "...",
    //   "updatedAt": "..."
    // }
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
    // --- PAYLOAD (Request Body) ---
    // Expected Request Payload (JSON): { "userId": "string", "productId": "string", "quantity": "number" }
    // Example: { "userId": "mock-user-id-123", "productId": "65a123456789abcdef0123456", "quantity": 1 }
    const { userId, productId, quantity } = await request.json();

    if (!userId || !productId || !quantity) {
      return new Response(JSON.stringify({ error: 'Missing required fields (userId, productId, quantity)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cartCollection = db.collection('carts');
    const productsCollection = db.collection('products');

    // Find the cart for the user
    // --- DATABASE OPERATION ---
    const cart = await cartCollection.findOne({ userId });

    if (cart) {
      // Cart exists, check if product is already in it
      const existingItem = cart.items.find(item => item.productId.toString() === productId); // Convert ObjectId to string for comparison
      if (existingItem) {
        // Product found, update its quantity
        // --- DATABASE OPERATION (Update Existing Item) ---
        await cartCollection.updateOne(
          { userId, 'items.productId': new ObjectId(productId) }, // Target the specific item by productId
          { $set: { 'items.$.quantity': existingItem.quantity + quantity, updatedAt: new Date() } }
        );
      } else {
        // Product not found, add new item to cart
        // --- DATABASE OPERATION (Add New Item) ---
        await cartCollection.updateOne(
          { userId },
          { $push: { items: { productId: new ObjectId(productId), quantity } }, $set: { updatedAt: new Date() } }
        );
      }
    } else {
      // No cart exists for this user, create a new one
      // --- DATABASE OPERATION (Create New Cart) ---
      await cartCollection.insertOne({
        userId,
        items: [{ productId: new ObjectId(productId), quantity }],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Fetch the updated cart with full product details to send back to the client
    // This allows the client to re-render the cart state immediately with fresh data.
    // --- DATA FETCHING (Post-Update GET) ---
    const updatedCart = await cartCollection.findOne({ userId });
    const itemsWithDetails = await Promise.all(
      updatedCart.items.map(async (item) => {
        const product = await productsCollection.findOne({ _id: new ObjectId(item.productId) });
        return { ...item, product: product || {} };
      })
    );

    // Expected Response Payload (JSON): (Same structure as GET response, but with updated quantities/items)
    // {
    //   "_id": "...",
    //   "userId": "mock-user-id-123",
    //   "items": [...], // Updated list of items with product details
    //   "createdAt": "...",
    //   "updatedAt": "..."
    // }
    return new Response(JSON.stringify({ ...updatedCart, items: itemsWithDetails }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error adding/updating cart item:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request) {
  try {
    const { db } = await connectToDatabase();
    // --- PAYLOAD (Request Body) ---
    // Expected Request Payload (JSON): { "userId": "string", "productId": "string", "quantity": "number" }
    // Example: { "userId": "mock-user-id-123", "productId": "65a123456789abcdef0123456", "quantity": 5 }
    const { userId, productId, quantity } = await request.json();

    if (!userId || !productId || typeof quantity !== 'number') {
      return new Response(JSON.stringify({ error: 'Missing required fields (userId, productId, quantity) or invalid quantity' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cartCollection = db.collection('carts');
    const productsCollection = db.collection('products');

    // --- DATABASE OPERATION ---
    // Find the cart and then update the quantity of the specific item
    const updateResult = await cartCollection.updateOne(
      { userId, 'items.productId': new ObjectId(productId) }, // Find cart by userId and specific item by productId
      { $set: { 'items.$.quantity': quantity, updatedAt: new Date() } } // Update the quantity and updatedAt field
    );

    if (updateResult.matchedCount === 0) {
      return new Response(JSON.stringify({ error: 'Cart or item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch the updated cart with full product details
    // --- DATA FETCHING (Post-Update GET) ---
    const updatedCart = await cartCollection.findOne({ userId });
    const itemsWithDetails = await Promise.all(
      updatedCart.items.map(async (item) => {
        const product = await productsCollection.findOne({ _id: new ObjectId(item.productId) });
        return { ...item, product: product || {} };
      })
    );

    // Expected Response Payload (JSON): (Same structure as GET response, but with updated quantity)
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
    // --- PAYLOAD (Request Body) ---
    // Expected Request Payload (JSON): { "userId": "string", "productId": "string" }
    // Example: { "userId": "mock-user-id-123", "productId": "65a123456789abcdef0123456" }
    const { userId, productId } = await request.json();

    if (!userId || !productId) {
      return new Response(JSON.stringify({ error: 'Missing required fields (userId, productId)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cartCollection = db.collection('carts');
    const productsCollection = db.collection('products');

    // --- DATABASE OPERATION ---
    // Remove the specified item from the 'items' array in the cart document
    const updateResult = await cartCollection.updateOne(
      { userId },
      { $pull: { items: { productId: new ObjectId(productId) } }, $set: { updatedAt: new Date() } }
    );

    if (updateResult.matchedCount === 0) {
      return new Response(JSON.stringify({ error: 'Cart not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch the updated cart with full product details
    // --- DATA FETCHING (Post-Delete GET) ---
    const updatedCart = await cartCollection.findOne({ userId });
    // Handle case where cart might become null if last item was removed and cart document was deleted (depends on your DB logic)
    const itemsWithDetails = updatedCart
      ? await Promise.all(
          updatedCart.items.map(async (item) => {
            const product = await productsCollection.findOne({ _id: new ObjectId(item.productId) });
            return { ...item, product: product || {} };
          })
        )
      : []; // If cart is null, return empty array

    // Expected Response Payload (JSON): (Same structure as GET response, but with item removed)
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