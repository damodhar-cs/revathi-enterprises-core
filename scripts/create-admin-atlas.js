const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Atlas connection - from .env file
const DATABASE_URL = 'mongodb+srv://damodhar:EFtSluPC4v471SLV@cluster0.f8qnd27.mongodb.net/users?retryWrites=true&w=majority';

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
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(DATABASE_URL);
    console.log('✅ Connected to MongoDB Atlas');

    // Check if admin user already exists
    const existingUser = await User.findOne({ email: 'reddivaridamu25091999@gmail.com' });
    
    if (existingUser) {
      console.log('⚠️  Admin user already exists in MongoDB Atlas!');
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
      
      console.log('✅ Admin user created successfully in MongoDB Atlas!');
      console.log('\n📋 Login Credentials:');
      console.log('📧 Email: reddivaridamu25091999@gmail.com');
      console.log('🔐 Password: 121212');
      console.log('\n✅ You can now login with these credentials');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('bad auth')) {
      console.error('\n⚠️  MongoDB Atlas authentication failed!');
      console.error('Check your MongoDB Atlas credentials in .env file');
    }
    if (error.message.includes('Could not connect')) {
      console.error('\n⚠️  Cannot connect to MongoDB Atlas!');
      console.error('Check your internet connection and MongoDB Atlas settings');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

createAdminUser();

