#!/usr/bin/env node

/**
 * Simple seeder for PostgreSQL database
 */

const { Client } = require('pg');
require('dotenv').config();

async function seedDatabase() {
  console.log('🌱 Seeding PostgreSQL database...\n');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Create some categories
    console.log('📁 Creating categories...');
    const categoryInserts = [
      { name: 'Electronics', description: 'Electronic devices and gadgets' },
      { name: 'Clothing', description: 'Fashion and apparel' },
      { name: 'Books', description: 'Books and educational materials' },
      { name: 'Sports', description: 'Sports equipment and gear' }
    ];

    for (const cat of categoryInserts) {
      try {
        await client.query(
          'INSERT INTO categories (id, name, description, slug, "isActive") VALUES (gen_random_uuid(), $1, $2, $3, true)',
          [cat.name, cat.description, cat.name.toLowerCase()]
        );
        console.log(`✅ Category: ${cat.name}`);
      } catch (error) {
        if (error.code === '23505') { // Duplicate key
          console.log(`⚠️  Category ${cat.name}: Already exists`);
        } else {
          console.log(`⚠️  Category ${cat.name}: ${error.message}`);
        }
      }
    }

    // Get category IDs
    const categories = await client.query('SELECT id, name FROM categories LIMIT 4');
    
    if (categories.rows.length > 0) {
      console.log('\n📦 Creating products...');
      const productInserts = [
        { name: 'Laptop Gaming', description: 'High-performance gaming laptop', price: 1299.99, categoryId: categories.rows[0].id },
        { name: 'Smartphone', description: 'Latest smartphone model', price: 699.99, categoryId: categories.rows[0].id },
        { name: 'T-Shirt', description: 'Comfortable cotton t-shirt', price: 19.99, categoryId: categories.rows[1]?.id || categories.rows[0].id },
        { name: 'Programming Book', description: 'Learn to code like a pro', price: 49.99, categoryId: categories.rows[2]?.id || categories.rows[0].id },
        { name: 'Tennis Racket', description: 'Professional tennis racket', price: 159.99, categoryId: categories.rows[3]?.id || categories.rows[0].id }
      ];

      for (const prod of productInserts) {
        try {
          await client.query(
            'INSERT INTO products (id, name, description, price, "categoryId", "isActive") VALUES (gen_random_uuid(), $1, $2, $3, $4, true)',
            [prod.name, prod.description, prod.price, prod.categoryId]
          );
          console.log(`✅ Product: ${prod.name} - $${prod.price}`);
        } catch (error) {
          if (error.code === '23505') { // Duplicate key
            console.log(`⚠️  Product ${prod.name}: Already exists`);
          } else {
            console.log(`⚠️  Product ${prod.name}: ${error.message}`);
          }
        }
      }
    }

    // Check final counts
    const catCount = await client.query('SELECT COUNT(*) FROM categories');
    const prodCount = await client.query('SELECT COUNT(*) FROM products');
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Database Summary:');
    console.log(`Categories: ${catCount.rows[0].count}`);
    console.log(`Products: ${prodCount.rows[0].count}`);
    console.log('🎉 Database seeded successfully!');

    await client.end();
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
