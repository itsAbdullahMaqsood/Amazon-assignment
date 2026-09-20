import mongoose from "mongoose";

// One connection promise is cached on globalThis so hot reloads in development and
// concurrent route handlers reuse the same socket instead of opening a new one.
const globalCache = globalThis as any;

if (!globalCache.mongooseConn) {
    globalCache.mongooseConn = { conn: null, promise: null };
}

const connectDb = async () => {
    if (globalCache.mongooseConn.conn) {
        return globalCache.mongooseConn.conn;
    }

    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        throw new Error("MONGODB_URI is not set. Add it to .env.local before querying the database.");
    }

    if (!globalCache.mongooseConn.promise) {
        globalCache.mongooseConn.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
        });
    }

    try {
        globalCache.mongooseConn.conn = await globalCache.mongooseConn.promise;
    } catch (error) {
        globalCache.mongooseConn.promise = null;
        throw error;
    }

    return globalCache.mongooseConn.conn;
};

export default connectDb;
