const { Pool } = require('pg');

async function simpleProductCheck() {
  const pool = new Pool({
    connectionString: 'postgresql://ecommerce_6zer_user:RoKDnyLSw9Xs0sD4lKJGWWzh4NJe2Ixb@dpg-csmmnnggph6c73fsg5p0-a.oregon-postgres.render.com/ecommerce_6zer',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000,
    max: 1
  });

  try {
    console.log('🔍 Checking products table...');
    
    // Just count products
    const result = await pool.query('SELECT COUNT(*) FROM products');
    console.log(`📊 Total products: ${result.rows[0].count}`);
    
    // Try simple select
    const simple = await pool.query('SELECT id, name FROM products LIMIT 1');
    console.log(`📋 Sample product: ${simple.rows[0]?.name || 'No products'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end().catch(() => {});
  }
}

simpleProductCheck();
