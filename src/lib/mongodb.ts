// lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI: string = process.env.NEXT_PUBLIC_API_MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('กรุณากำหนดค่า MONGODB_URI ในไฟล์ .env.local');
}

interface MongooseGlobal extends Global {
  mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const globalWithMongoose = global as unknown as MongooseGlobal;

let cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
