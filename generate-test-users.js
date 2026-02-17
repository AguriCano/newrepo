const bcrypt = require('bcryptjs');

// Contraseña estándar para todos: Password123!
const testPassword = 'Password123!';

const users = [
  { firstname: 'Happy', lastname: 'User', email: 'happy@340.edu', type: 'Employee' },
  { firstname: 'Basic', lastname: 'Client', email: 'basic@340.edu', type: 'Client' },
  { firstname: 'Manager', lastname: 'Admin', email: 'manager@340.edu', type: 'Admin' },
  { firstname: 'Admin', lastname: 'User', email: 'admin@cse340.net', type: 'Admin' },
  { firstname: 'Sally', lastname: 'Jones', email: 'sally@jones.com', type: 'Client' },
  { firstname: 'Lori', lastname: 'Robertson', email: 'lorirobertson@gmail.com', type: 'Client' }
];

async function generateHashes() {
  try {
    console.log('Generating bcrypt hashes for test users...\n');
    
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      console.log(`INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ('${user.firstname}', '${user.lastname}', '${user.email}', '${hashedPassword}', '${user.type}'::account_type);`);
    }
    
    console.log('\n--- Test User Credentials ---');
    console.log(`Password for all users: ${testPassword}\n`);
    users.forEach(user => {
      console.log(`${user.firstname} ${user.lastname} (${user.type}): ${user.email}`);
    });
    
  } catch (error) {
    console.error('Error generating hashes:', error);
  }
}

generateHashes();
