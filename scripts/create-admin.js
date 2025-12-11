const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string - update this if needed
const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/revathi-enterprises';

// User Schema (simplified version matching your backend)
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, default: 'system' },
  updatedBy: { type: String, default: 'system' },
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(DATABASE_URL);
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingUser = await User.findOne({ email: 'reddivaridamu25091999@gmail.com' });
    
    if (existingUser) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', existingUser.email);
      console.log('👤 Name:', `${existingUser.firstName} ${existingUser.lastName || ''}`);
      console.log('🔐 Password: 121212');
      console.log('\n✅ You can now login with these credentials');
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash('121212', 10);

      // Create admin user
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'reddivaridamu25091999@gmail.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        createdBy: 'system',
        updatedBy: 'system'
      });

      await adminUser.save();
      
      console.log('✅ Admin user created successfully!');
      console.log('\n📋 Login Credentials:');
      console.log('📧 Email: reddivaridamu25091999@gmail.com');
      console.log('🔐 Password: 121212');
      console.log('\n✅ You can now login with these credentials');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  MongoDB is not running!');
      console.error('Please start MongoDB first:');
      console.error('  - macOS: brew services start mongodb-community');
      console.error('  - Linux: sudo systemctl start mongod');
      console.error('  - Windows: net start MongoDB');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createAdminUser();

