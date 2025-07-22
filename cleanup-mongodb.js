const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupMongoDB() {
  console.log('🧹 LIMPIANDO MONGODB - Eliminando colecciones innecesarias\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');
    
    const db = mongoose.connection.db;
    
    // Lista de colecciones que queremos MANTENER (nombres exactos de Mongoose)
    const keepCollections = ['searchanalytics', 'orderitemmongos'];
    
    // Obtener todas las colecciones
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Colecciones encontradas:');
    collections.forEach(col => console.log(`   • ${col.name}`));
    
    // Eliminar colecciones que NO están en la lista de mantener
    console.log('\n🗑️ Eliminando colecciones innecesarias:');
    for (const collection of collections) {
      if (!keepCollections.includes(collection.name)) {
        try {
          await db.dropCollection(collection.name);
          console.log(`   ❌ Eliminada: ${collection.name}`);
        } catch (error) {
          console.log(`   ⚠️ Error eliminando ${collection.name}: ${error.message}`);
        }
      } else {
        console.log(`   ✅ Mantenida: ${collection.name}`);
      }
    }
    
    // Verificar el resultado final
    const finalCollections = await db.listCollections().toArray();
    console.log('\n✅ RESULTADO FINAL:');
    console.log(`   • Total de colecciones: ${finalCollections.length}`);
    finalCollections.forEach(col => {
      console.log(`   • ${col.name}`);
    });
    
    if (finalCollections.length === 2) {
      console.log('\n🎯 ¡PERFECTO! MongoDB ahora tiene exactamente 2 colecciones');
    } else {
      console.log(`\n⚠️ Advertencia: Se esperaban 2 colecciones, pero hay ${finalCollections.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 Desconectado de MongoDB');
  }
}

cleanupMongoDB().catch(console.error);
