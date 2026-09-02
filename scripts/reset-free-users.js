const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

async function reset() {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await mongoose.connection.collection('users').updateMany(
    { plan: 'free' },
    { $set: { aiUsageCount: 0 } }
  );
  console.log('Reset count:', result.modifiedCount);
  const users = await mongoose.connection.collection('users').find({}).toArray();
  console.log('Users now:', users.map(u => ({ email: u.email, plan: u.plan, aiUsageCount: u.aiUsageCount })));
  await mongoose.disconnect();
}

reset().catch(console.error);
