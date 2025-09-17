
import { connectToDatabase } from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return new Response(
        JSON.stringify({ message: "Search query is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { db } = await connectToDatabase();
    const productsCollection = db.collection("products");

    // Search products by title or description (case-insensitive)
    const products = await productsCollection
      .find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      })
      .limit(20)
      .toArray();

    const serializedProducts = products.map((product) => ({
      _id: product._id.toString(),
      title: product.title,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl || "/placeholder.jpg",
      categoryId: product.categoryId ? product.categoryId.toString() : null,
    }));

    return new Response(JSON.stringify(serializedProducts), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Search error:", error.message);
    return new Response(
      JSON.stringify({ message: "Failed to perform search" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
