const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DATABASE_URL = 'mongodb+srv://damodhar:EFtSluPC4v471SLV@cluster0.f8qnd27.mongodb.net/users?retryWrites=true&w=majority';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function checkUser() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(DATABASE_URL);
    console.log('✅ Connected\n');

    const user = await User.findOne({ email: 'reddivaridamu25091999@gmail.com' });
    
    if (user) {
      console.log('📋 User found:');
      console.log('Email:', user.email);
      console.log('First Name:', user.firstName);
      console.log('Last Name:', user.lastName);
      console.log('Role:', user.role);
      console.log('Active:', user.isActive);
      console.log('Password Hash:', user.password);
      console.log('\n🔐 Testing password "121212"...');
      
      const isValid = await bcrypt.compare('121212', user.password);
      console.log('Password valid:', isValid);
      
      if (!isValid) {
        console.log('\n⚠️  Password does NOT match!');
        console.log('Let me update it...');
        
        const newHash = await bcrypt.hash('121212', 10);
        await User.updateOne(
          { email: 'reddivaridamu25091999@gmail.com' },
          { password: newHash }
        );
        
        console.log('✅ Password updated successfully!');
        console.log('Try logging in again with:');
        console.log('Email: reddivaridamu25091999@gmail.com');
        console.log('Password: 121212');
      }
    } else {
      console.log('❌ User not found!');
      console.log('Creating new user...');
      
      const hashedPassword = await bcrypt.hash('121212', 10);
      const newUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'reddivaridamu25091999@gmail.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      
      await newUser.save();
      console.log('✅ User created!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected');
  }
}

checkUser();

