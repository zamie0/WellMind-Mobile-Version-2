// db.js
import mongoose from "mongoose";

let cached = global.mongoose || { conn: null, promise: null, bucket: null, db: null };

export default async function connectDB() {
  if (cached.conn) return cached;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || "WellMind",
    }).then((mongooseInstance) => mongooseInstance);
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
  }

  global.mongoose = cached; // cache globally
  return cached; // now includes conn, bucket, and db
}