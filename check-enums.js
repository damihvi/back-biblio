const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkEnums() {
  try {
    await client.connect();
    
    // Verificar enums de role
    const roleEnums = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE pg_type.typname = 'users_role_enum'
    `);
    
    console.log('Valores válidos para users_role_enum:');
    roleEnums.rows.forEach(row => console.log(`  - ${row.enumlabel}`));
    
    // Verificar estructura de tabla users
    const columns = await client.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nEstructura de tabla users:');
    columns.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.udt_name})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkEnums();
