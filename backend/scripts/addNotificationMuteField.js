// backend/scripts/addNotificationMuteField.js

const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('MongoDB URI:', MONGODB_URI);

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in the .env file');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

async function updateUsers() {
  try {
    const result = await User.updateMany(
      { isNotificationsMuted: { $exists: false } },
      { $set: { isNotificationsMuted: false } }
    );
    console.log(`Updated ${result.nModified} users`);
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    mongoose.connection.close()
      .then(() => console.log('MongoDB connection closed'))
      .catch(err => console.error('Error closing MongoDB connection:', err));
  }
}

mongoose.connection.once('open', () => {
  console.log('MongoDB connection opened, running update...');
  updateUsers();
});
