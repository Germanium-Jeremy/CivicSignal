import connectDB from '@/lib/mongodb';

export async function connectToDatabase() {
  return await connectDB();
}
