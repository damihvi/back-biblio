#!/usr/bin/env node

/**
 * Check database tables and structure
 */

const { Client } = require('pg');
require('dotenv').config();

async function checkDatabase() {
  console.log('🔍 Checking PostgreSQL database structure...\n');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Check existing tables
    const tables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    
    console.log('\n📋 Existing tables:');
    if (tables.rows.length === 0) {
      console.log('❌ No tables found');
    } else {
      tables.rows.forEach(table => {
        console.log(`  - ${table.tablename}`);
      });
    }

    // If we have tables, check their structure
    for (const table of tables.rows) {
      console.log(`\n🔍 Structure of ${table.tablename}:`);
      const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table.tablename]);
      
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    }

    await client.end();
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
    process.exit(1);
  }
}

checkDatabase();
