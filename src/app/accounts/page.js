
"use client";
import React, { useState, useEffect } from "react";
import { Loader2, LogOut, Mail, Camera, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailForm, setEmailForm] = useState({ email: "" });
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/session", { credentials: "include" });
        if (!response.ok) {
          throw new Error("Failed to fetch user session");
        }
        const data = await response.json();
        if (data.session) {
          setUser(data.session.user);
          setEmailForm({ email: data.session.user.email });
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error.message);
        toast.error("Failed to load user data", {
          style: {
            background: "#FFFFFF",
            color: "#1F2937",
            border: "1px solid #EF4444",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
          },
          iconTheme: { primary: "#EF4444", secondary: "#FFFFFF" },
        });
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to logout");
      }
      toast.success("Logged out successfully!", {
        style: {
          background: "#FFFFFF",
          color: "#1F2937",
          border: "1px solid #F85606",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(248, 86, 6, 0.2)",
        },
        iconTheme: { primary: "#F85606", secondary: "#FFFFFF" },
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error.message);
      toast.error("Failed to logout", {
        style: {
          background: "#FFFFFF",
          color: "#1F2937",
          border: "1px solid #EF4444",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
        },
        iconTheme: { primary: "#EF4444", secondary: "#FFFFFF" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    if (!emailForm.email) {
      toast.error("Please enter a new email", {
        style: {
          background: "#FFFFFF",
          color: "#1F2937",
          border: "1px solid #EF4444",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
        },
        iconTheme: { primary: "#EF4444", secondary: "#FFFFFF" },
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/users/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailForm.email }),
        credentials: "include",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update email");
      }
      setUser((prev) => ({ ...prev, email: emailForm.email }));
      toast.success("Email updated successfully!", {
        style: {
          background: "#FFFFFF",
          color: "#1F2937",
          border: "1px solid #F85606",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(248, 86, 6, 0.2)",
        },
        iconTheme: { primary: "#F85606", secondary: "#FFFFFF" },
      });
    } catch (error) {
      console.error("Email update error:", error.message);
      toast.error(error.message || "Failed to update email", {
        style: {
          background: "#FFFFFF",
          color: "#1F2937",
          border: "1px solid #EF4444",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
        },
        iconTheme: { primary: "#EF4444", secondary: "#FFFFFF" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Please fill in both password fields", {
        style: {
          background: "#FFFFFF",
          color: "#1F2937",
          border: "1px solid #EF4444",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
        },
        iconTheme: { primary: "#EF4444", secondary: "#FFFFFF" },
      });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match", {
        style: {
          background: "#FFFFFF",
          color: "#1F2937",
          border: "1px solid #EF4444",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
        },
        iconTheme: { primary: "#EF4444", secondary: "#FFFFFF" },
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/users/reset-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: passwordForm.newPassword }),
        credentials: "include",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to reset password");
      }
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      toast.success("Password reset successfully!", {
        style: {
          background: "#FFFFFF",
          color: "#1F2937",
          border: "1px solid #F85606",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(248, 86, 6, 0.2)",
        },
        iconTheme: { primary: "#F85606", secondary: "#FFFFFF" },
      });
    } catch (error) {
      console.error("Password reset error:", error.message);
      toast.error(error.message || "Failed to reset password", {
        style: {
          background: "#FFFFFF",
          color: "#1F2937",
          border: "1px solid #EF4444",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
        },
        iconTheme: { primary: "#EF4444", secondary: "#FFFFFF" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!profilePicture) {
      toast.error("Please select an image", {
        style: {
          background: "#FFFFFF",
          color: "#1F2937",
          border: "1px solid #EF4444",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
        },
        iconTheme: { primary: "#EF4444", secondary: "#FFFFFF" },
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", profilePicture);
      formData.append("upload_preset", "profile_pictures");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("Failed to upload image to Cloudinary");
      }
      const data = await response.json();
      const imageUrl = data.secure_url;

      // Update user profile with image URL
      const updateResponse = await fetch("/api/users/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePicture: imageUrl }),
        credentials: "include",
      });
      if (!updateResponse.ok) {
        const updateData = await updateResponse.json();
        throw new Error(updateData.message || "Failed to update profile picture");
      }
      setUser((prev) => ({ ...prev, profilePicture: imageUrl }));
      setProfilePicture(null);
      setPreviewImage(null);
      toast.success("Profile picture updated successfully!", {
        style: {
          background: "#FFFFFF",
          color: "#1F2937",
          border: "1px solid #F85606",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(248, 86, 6, 0.2)",
        },
        iconTheme: { primary: "#F85606", secondary: "#FFFFFF" },
      });
    } catch (error) {
      console.error("Profile picture upload error:", error.message);
      toast.error(error.message || "Failed to update profile picture", {
        style: {
          background: "#FFFFFF",
          color: "#1F2937",
          border: "1px solid #EF4444",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
        },
        iconTheme: { primary: "#EF4444", secondary: "#FFFFFF" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-8 lg:px-16 font-poppins">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

      {/* User Details */}
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-sm border mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-lg font-semibold mb-4">Profile Details</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            {user.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt="Profile Picture"
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
            <div>
              <p className="text-gray-700 font-medium">Name: {user.name}</p>
              <p className="text-gray-700">Email: {user.email}</p>
              <p className="text-gray-700">Role: {user.role}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Picture Upload */}
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-sm border mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <h2 className="text-lg font-semibold mb-4">Update Profile Picture (Optional)</h2>
        {previewImage && (
          <Image
            src={previewImage}
            alt="Profile Picture Preview"
            width={100}
            height={100}
            className="rounded-full object-cover mb-4"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleProfilePictureChange}
          className="mb-4"
          disabled={isSubmitting}
        />
        <motion.button
          onClick={handleProfilePictureUpload}
          disabled={isSubmitting || !profilePicture}
          className="flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Camera className="w-5 h-5 mr-2" />
          {isSubmitting ? "Uploading..." : "Upload Profile Picture"}
        </motion.button>
      </motion.div>

      {/* Change Email */}
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-sm border mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="text-lg font-semibold mb-4">Change Email (Optional)</h2>
        <form onSubmit={handleEmailChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">New Email</label>
            <input
              type="email"
              name="email"
              value={emailForm.email}
              onChange={(e) => setEmailForm({ email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 transition-colors duration-200"
              disabled={isSubmitting}
            />
          </div>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Mail className="w-5 h-5 mr-2" />
            {isSubmitting ? "Updating..." : "Update Email"}
          </motion.button>
        </form>
      </motion.div>

      {/* Reset Password */}
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-sm border mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="text-lg font-semibold mb-4">Reset Password (Optional)</h2>
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 transition-colors duration-200"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 transition-colors duration-200"
              disabled={isSubmitting}
            />
          </div>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Lock className="w-5 h-5 mr-2" />
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </motion.button>
        </form>
      </motion.div>

      {/* Logout */}
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-sm border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <motion.button
          onClick={handleLogout}
          disabled={isSubmitting}
          className="flex items-center justify-center bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50 w-full"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut className="w-5 h-5 mr-2" />
          {isSubmitting ? "Logging out..." : "Log Out"}
        </motion.button>
      </motion.div>
    </div>
  );
}
