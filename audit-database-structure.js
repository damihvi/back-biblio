const { Client } = require('pg');
const mongoose = require('mongoose');
require('dotenv').config();

async function checkPostgreSQL() {
  console.log('🔍 Checking PostgreSQL tables...\n');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    
    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 PostgreSQL Tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   • ${row.table_name}`);
    });
    
    // Get table sizes and row counts
    console.log('\n📊 Table Statistics:');
    for (const row of tablesResult.rows) {
      const tableName = row.table_name;
      try {
        const countResult = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
        const count = countResult.rows[0].count;
        console.log(`   • ${tableName}: ${count} rows`);
      } catch (error) {
        console.log(`   • ${tableName}: Error counting rows`);
      }
    }
    
  } catch (error) {
    console.error('❌ PostgreSQL Error:', error.message);
  } finally {
    await client.end();
  }
}

async function checkMongoDB() {
  console.log('\n🔍 Checking MongoDB collections...\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-analytics');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('📋 MongoDB Collections:');
    if (collections.length === 0) {
      console.log('   • No collections found');
    } else {
      collections.forEach(collection => {
        console.log(`   • ${collection.name}`);
      });
    }
    
    // Get collection stats
    console.log('\n📊 Collection Statistics:');
    for (const collection of collections) {
      try {
        const stats = await db.collection(collection.name).stats();
        console.log(`   • ${collection.name}: ${stats.count} documents (${(stats.size / 1024).toFixed(2)} KB)`);
      } catch (error) {
        console.log(`   • ${collection.name}: Error getting stats`);
      }
    }
    
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

async function main() {
  console.log('🗄️  DATABASE STRUCTURE AUDIT\n');
  console.log('=' .repeat(50));
  
  console.log('Environment check:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Present' : 'Missing');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');
  console.log('');
  
  await checkPostgreSQL();
  await checkMongoDB();
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ Audit completed!');
}

main().catch(console.error);
