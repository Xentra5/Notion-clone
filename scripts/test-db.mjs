import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Error: MONGODB_URI is not defined in your environment variables.");
  process.exit(1);
}

console.log("Attempting to connect to MongoDB...");
try {
  await mongoose.connect(uri);
  console.log("Successfully connected to MongoDB!");
  await mongoose.disconnect();
  console.log("Disconnected successfully.");
} catch (error) {
  console.error("Failed to connect to MongoDB:");
  console.error(error);
  process.exit(1);
}
