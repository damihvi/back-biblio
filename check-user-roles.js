const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkUserRoles() {
  try {
    await client.connect();
    console.log('🔍 Verificando roles de usuarios en la base de datos...\n');
    
    const users = await client.query(`
      SELECT id, username, email, role, "firstName", "lastName" 
      FROM users 
      ORDER BY role, username
    `);
    
    console.log('👥 Usuarios en la base de datos:');
    users.rows.forEach(user => {
      console.log(`  - ${user.username} (${user.email}) → Role: "${user.role}"`);
    });
    
    console.log('\n🔍 Verificando usuario admin específicamente...');
    const adminUser = await client.query(`
      SELECT * FROM users WHERE email = 'admin@test.com'
    `);
    
    if (adminUser.rows.length > 0) {
      const admin = adminUser.rows[0];
      console.log('\n📋 Datos completos del admin:');
      Object.keys(admin).forEach(key => {
        console.log(`  ${key}: ${admin[key]}`);
      });
    } else {
      console.log('❌ No se encontró usuario admin');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkUserRoles();
