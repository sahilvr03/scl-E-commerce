
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { hash } from "bcryptjs";

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

export async function PATCH(req) {
  try {
    const userId = await authenticate();
    if (!userId) {
      return new Response(
        JSON.stringify({ message: "Unauthorized: No valid token provided" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { newPassword } = await req.json();

    if (!newPassword) {
      return new Response(
        JSON.stringify({ message: "New password is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");

    const hashedPassword = await hash(newPassword, 12);

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ message: "Failed to reset password" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Password reset successfully for user ${userId}`);
    return new Response(
      JSON.stringify({ message: "Password reset successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Password reset error:", error.message);
    return new Response(
      JSON.stringify({ message: "Failed to reset password" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
