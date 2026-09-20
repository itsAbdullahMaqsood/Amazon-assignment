import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

// Next.js hot-reloads modules in development, so the connection is cached on the
// global object to avoid opening a new one on every reload.
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

const connectDb = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!MONGODB_URI) {
        throw new Error("Please define the MONGODB_URI environment variable");
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGODB_URI, { bufferCommands: false })
            .then((mongooseInstance) => mongooseInstance);
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error;
    }

    return cached.conn;
};

export default connectDb;
