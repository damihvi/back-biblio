// Simple script to test MongoDB connection directly
const { MongoClient } = require('mongodb');

async function testMongoConnection() {
  console.log('🔗 PROBANDO CONEXIÓN DIRECTA A MONGODB');
  console.log('=====================================');
  
  try {
    const client = new MongoClient('mongodb+srv://damihvi:damianherreravillavicencio@cluster0.kydmd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    await client.connect();
    console.log('✅ Conectado a MongoDB Atlas');
    
    const db = client.db('ecommerce-analytics');
    console.log('✅ Base de datos seleccionada: ecommerce-analytics');
    
    // Intentar insertar un documento de prueba
    const testSearch = {
      query: 'test-from-script',
      category: 'testing',
      resultsCount: 5,
      userAgent: 'Test Script',
      ip: '127.0.0.1',
      createdAt: new Date()
    };
    
    console.log('📝 Insertando documento de prueba...');
    const result = await db.collection('searchanalytics').insertOne(testSearch);
    console.log('✅ Documento insertado con ID:', result.insertedId);
    
    // Verificar que se guardó
    const count = await db.collection('searchanalytics').countDocuments();
    console.log('📊 Total de documentos en searchanalytics:', count);
    
    // Mostrar últimos documentos
    const recent = await db.collection('searchanalytics').find().sort({createdAt: -1}).limit(3).toArray();
    console.log('📋 Últimas búsquedas:');
    recent.forEach((doc, i) => {
      console.log(`  ${i+1}. "${doc.query}" - ${doc.resultsCount} resultados`);
    });
    
    await client.close();
    console.log('✅ Conexión cerrada correctamente');
    
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
  }
}

testMongoConnection();
