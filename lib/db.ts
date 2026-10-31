import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (mongoose.connection.readyState >= 1) return mongoose.connection;
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri).then((connection) => {
      console.log("✅ MongoDB connected successfully at", uri.replace(/\/\/[^@]*@/, "//<credentials>@"));
      return connection;
    }).catch((error: unknown) => {
      connectionPromise = null;
      const message = error instanceof Error ? error.message : String(error);
      console.error("❌ MongoDB connection failed:", message);
      throw error;
    });
  }
  await connectionPromise;
  return mongoose.connection;
}
