require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { createAdminIfMissing } = require('./scripts/createAdmin');
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chat-app';

(async () => {
  await connectDB(MONGO_URI);
  try {
    await createAdminIfMissing();
  } catch (e) {
    console.error('Admin creation error:', e);
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
})();
