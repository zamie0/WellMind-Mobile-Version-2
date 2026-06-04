// db.js
import mongoose from "mongoose";

let cached = global.mongoose || { conn: null, promise: null, bucket: null, db: null };

export default async function connectDB() {
  if (cached.conn) return cached;

  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MongoDB connection URI is not configured. Set MONGODB_URI in your .env.");
  }

  mongoose.set("strictQuery", true);

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || "wellmind",
    }).then(() => mongoose);
  }

  try {
    cached.conn = await cached.promise;

    if (!cached.bucket) {
      cached.bucket = new mongoose.mongo.GridFSBucket(cached.conn.connection.db, {
        bucketName: "pdfs", // collection name: pdfs.files / pdfs.chunks
      });
    }

    if (!cached.db) {
      cached.db = cached.conn.connection.db;
    }

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    cached.promise = null;
    throw error;
  }

  global.mongoose = cached; // cache globally
  return cached; // now includes conn, bucket, and db
}
