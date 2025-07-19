const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixUserRoles() {
  try {
    await client.connect();
    console.log('🔧 Corrigiendo roles de usuarios...\n');
    
    // Verificar enum válidos
    const enums = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE pg_type.typname = 'users_role_enum'
    `);
    
    console.log('📋 Valores válidos para role enum:');
    enums.rows.forEach(row => console.log(`  - ${row.enumlabel}`));
    
    // Corregir roles usando los valores correctos del enum
    console.log('\n🔧 Actualizando roles...');
    
    // Admin
    await client.query(`
      UPDATE users 
      SET role = $1 
      WHERE email = 'admin@test.com'
    `, ['admin']);
    console.log('✅ Admin role actualizado');
    
    // Customer
    await client.query(`
      UPDATE users 
      SET role = $1 
      WHERE email = 'user@test.com'
    `, ['customer']);
    console.log('✅ Customer role actualizado');
    
    // Seller
    await client.query(`
      UPDATE users 
      SET role = $1 
      WHERE email = 'seller@test.com'
    `, ['seller']);
    console.log('✅ Seller role actualizado');
    
    // Verificar cambios
    console.log('\n🔍 Verificando roles actualizados...');
    const users = await client.query(`
      SELECT username, email, role 
      FROM users 
      ORDER BY role, username
    `);
    
    users.rows.forEach(user => {
      console.log(`  ✅ ${user.username} (${user.email}) → Role: "${user.role}"`);
    });
    
    console.log('\n🎉 ¡Roles corregidos exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

fixUserRoles();
