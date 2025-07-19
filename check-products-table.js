const { Pool } = require('pg');

async function checkProductsTable() {
  const pool = new Pool({
    connectionString: 'postgresql://ecommerce_6zer_user:RoKDnyLSw9Xs0sD4lKJGWWzh4NJe2Ixb@dpg-csmmnnggph6c73fsg5p0-a.oregon-postgres.render.com/ecommerce_6zer',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔍 Verificando datos en tabla products...');

    // Check table structure first
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'products'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Columnas en tabla products:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Check if there's any data
    const count = await pool.query('SELECT COUNT(*) FROM products');
    console.log(`\n📊 Total productos: ${count.rows[0].count}`);

    if (count.rows[0].count > 0) {
      // Check first few records
      const sample = await pool.query('SELECT id, name, sku, price, "categoryId" FROM products LIMIT 5');
      console.log('\n🔍 Primeros productos:');
      sample.rows.forEach(product => {
        console.log(`  - ${product.name} (sku: ${product.sku}, category: ${product.categoryId})`);
      });

      // Check for null categoryId
      const nullCategories = await pool.query('SELECT COUNT(*) FROM products WHERE "categoryId" IS NULL');
      console.log(`\n⚠️  Productos sin categoría: ${nullCategories.rows[0].count}`);

      // Check for null sku
      const nullSku = await pool.query('SELECT COUNT(*) FROM products WHERE sku IS NULL');
      console.log(`⚠️  Productos sin SKU: ${nullSku.rows[0].count}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkProductsTable();
