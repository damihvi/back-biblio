const mongoose = require('mongoose');
require('dotenv').config();

async function checkMongoDB() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log(`\nColecciones encontradas (${collections.length}):`);
    collections.forEach(col => console.log(`• ${col.name}`));
    
    await mongoose.connection.close();
    console.log('\nDesconectado.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkMongoDB();
