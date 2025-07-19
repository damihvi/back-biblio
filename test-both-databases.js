#!/usr/bin/env node

/**
 * Simple test script for database connections
 */

const { Client } = require('pg');
const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Testing Database Connections...\n');

// Test PostgreSQL
async function testPostgreSQL() {
  console.log('📊 Testing PostgreSQL (Neon)...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ PostgreSQL: Connected successfully');
    
    // Test basic query
    const result = await client.query('SELECT NOW()');
    console.log(`✅ PostgreSQL: Query test passed - ${result.rows[0].now}`);
    
    await client.end();
    return true;
  } catch (error) {
    console.log(`❌ PostgreSQL: ${error.message}`);
    return false;
  }
}

// Test MongoDB
async function testMongoDB() {
  console.log('\n📊 Testing MongoDB (Atlas)...');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ MongoDB: Connected successfully');
    
    // Test basic operation
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log('✅ MongoDB: Write test passed');
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log(`❌ MongoDB: ${error.message}`);
    return false;
  }
}

// Run tests
async function runTests() {
  const pgResult = await testPostgreSQL();
  const mongoResult = await testMongoDB();
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 Database Connection Summary:');
  console.log(`PostgreSQL (Neon): ${pgResult ? '✅ Working' : '❌ Failed'}`);
  console.log(`MongoDB (Atlas): ${mongoResult ? '✅ Working' : '❌ Failed'}`);
  
  if (pgResult && mongoResult) {
    console.log('\n🎉 Both databases are accessible!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some database connections failed.');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('💥 Test runner error:', error.message);
  process.exit(1);
});
