
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "../../lib/mongodb";
import { ObjectId } from "mongodb";

async function authenticate() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    console.error("Unauthorized request: No token provided");
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return null;
  }
}

export async function GET(req) {
  try {
    const userId = await authenticate();
    if (!userId) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { db } = await connectToDatabase();
    const ordersCollection = db.collection("orders");
    const productsCollection = db.collection("products");

    const orders = await ordersCollection
      .find({ userId: new ObjectId(userId) })
      .toArray();

    // Handle both single-item and multi-item orders
    const serializedOrders = await Promise.all(
      orders.map(async (order) => {
        let itemsWithDetails = [];

        // Check if order has single productId (from ProductDetailPage) or items array (from CheckoutPage)
        if (order.productId) {
          // Single-item order
          const product = await productsCollection.findOne({
            _id: new ObjectId(order.productId),
          });
          itemsWithDetails = [{
            productId: order.productId.toString(),
            quantity: order.quantity || 1,
            product: product
              ? {
                  title: product.title,
                  price: product.price,
                  imageUrl: product.imageUrl || "/placeholder.jpg",
                }
              : { title: "Unknown Product", price: 0, imageUrl: "/placeholder.jpg" },
          }];
        } else if (order.items && Array.isArray(order.items)) {
          // Multi-item order
          itemsWithDetails = await Promise.all(
            order.items.map(async (item) => {
              const product = await productsCollection.findOne({
                _id: new ObjectId(item.productId),
              });
              return {
                productId: item.productId.toString(),
                quantity: item.quantity,
                product: product
                  ? {
                      title: product.title,
                      price: product.price,
                      imageUrl: product.imageUrl || "/placeholder.jpg",
                    }
                  : { title: "Unknown Product", price: 0, imageUrl: "/placeholder.jpg" },
              };
            })
          );
        }

        return {
          _id: order._id.toString(),
          userId: order.userId.toString(),
          items: itemsWithDetails,
          paymentMethod: order.paymentMethod,
          shippingDetails: order.shippingDetails,
          status: order.status,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
        };
      })
    );

    return new Response(JSON.stringify(serializedOrders), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("User orders fetch error:", error.message);
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req) {
  try {
    const userId = await authenticate();
    if (!userId) {
      console.error("Unauthorized request: No token provided");
      return new Response(
        JSON.stringify({ message: "Order not created" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { productId, quantity, items, paymentMethod, shippingDetails, status } = await req.json();

    // Validate required fields
    if (!paymentMethod || !shippingDetails || !status) {
      console.error("Missing required fields: paymentMethod, shippingDetails, or status");
      return new Response(
        JSON.stringify({ message: "Order not created: Missing required fields" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle single-item (from ProductDetailPage) or multi-item (from CheckoutPage) orders
    let validItems = [];
    if (productId && quantity) {
      // Single-item order from ProductDetailPage
      if (!productId || quantity < 1) {
        console.error("Invalid productId or quantity");
        return new Response(
          JSON.stringify({ message: "Order not created: Invalid product or quantity" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      validItems = [{ productId: new ObjectId(productId), quantity }];
    } else if (items && Array.isArray(items) && items.length > 0) {
      // Multi-item order from CheckoutPage
      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity < 1) {
          console.error(`Invalid item: ${JSON.stringify(item)}`);
          continue;
        }
        validItems.push({
          productId: new ObjectId(item.productId),
          quantity: item.quantity,
        });
      }
      if (validItems.length === 0) {
        console.error("No valid items in order");
        return new Response(
          JSON.stringify({ message: "Order not created: No valid items" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } else {
      console.error("Missing productId/quantity or items array");
      return new Response(
        JSON.stringify({ message: "Order not created: Missing items" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { db } = await connectToDatabase();
    const ordersCollection = db.collection("orders");
    const productsCollection = db.collection("products");

    // Validate products exist
    for (const item of validItems) {
      const product = await productsCollection.findOne({ _id: item.productId });
      if (!product) {
        console.error(`Product not found: ${item.productId}`);
        return new Response(
          JSON.stringify({ message: "Order not created: One or more products not found" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    const order = {
      userId: new ObjectId(userId),
      items: validItems, // Store all items, even if single-item order
      paymentMethod,
      shippingDetails,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ordersCollection.insertOne(order);
    console.log(`Order created successfully for user ${userId}, orderId: ${result.insertedId}`);

    return new Response(
      JSON.stringify({
        message: "Order placed successfully",
        orderId: result.insertedId.toString(),
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Order creation error:", error.message);
    return new Response(
      JSON.stringify({ message: "Order not created" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
