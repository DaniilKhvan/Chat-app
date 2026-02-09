require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { createAdminIfMissing } = require('./scripts/createAdmin');
const PORT = process.env.PORT || 3000;

(async () => {
  await connectDB(); 
  
  try {
    await createAdminIfMissing();
  } catch (e) {
    console.error('Admin creation error:', e);
  }

  app.listen(PORT, '0.0.0.0', () => {  
    console.log(`✅ Server running on port ${PORT}`);
  });
})();