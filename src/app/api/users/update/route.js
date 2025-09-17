
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "../../../lib/mongodb";
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

    const { email, profilePicture } = await req.json();

    if (!email && !profilePicture) {
      return new Response(
        JSON.stringify({ message: "No updates provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");

    const updateFields = { updatedAt: new Date() };
    if (email) {
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return new Response(
          JSON.stringify({ message: "Invalid email format" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      // Check for existing email
      const existingUser = await usersCollection.findOne({ email, _id: { $ne: new ObjectId(userId) } });
      if (existingUser) {
        return new Response(
          JSON.stringify({ message: "Email already in use" }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      updateFields.email = email;
    }
    if (profilePicture) {
      updateFields.profilePicture = profilePicture;
    }

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ message: "No changes made to user profile" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(`User profile updated successfully for user ${userId}`);
    return new Response(
      JSON.stringify({ message: "Profile updated successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("User update error:", error.message);
    return new Response(
      JSON.stringify({ message: "Failed to update profile" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
