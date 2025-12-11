const bcrypt = require('bcryptjs');

// The password hash from database
const hashFromDB = '$2a$10$hWphlM5Du0Be0X2djSWM4O7wAcmMxfr5vHABoUeWv5ZKC90BWDWqi';
const plainPassword = '121212';

console.log('Testing password verification...\n');
console.log('Plain password:', plainPassword);
console.log('Hash from DB:', hashFromDB);
console.log('\nVerifying...');

bcrypt.compare(plainPassword, hashFromDB).then(result => {
  console.log('Result:', result);
  if (result) {
    console.log('✅ Password matches!');
  } else {
    console.log('❌ Password does NOT match!');
  }
}).catch(err => {
  console.error('Error:', err.message);
});

