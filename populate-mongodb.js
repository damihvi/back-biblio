const mongoose = require('mongoose');
const { searchAnalyticsData } = require('./sample-data/search-analytics-data');
const { orderItemsData } = require('./sample-data/order-items-data');
require('dotenv').config();

// Definir esquemas (mismos que en el código principal)
const SearchAnalyticsSchema = new mongoose.Schema({
  query: { type: String, required: true },
  category: String,
  resultsCount: { type: Number, default: 0 },
  userAgent: String,
  ip: String
}, { timestamps: true });

const OrderItemMongoSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  subtotal: { type: Number, required: true }
}, { timestamps: true });

async function populateMongoDB() {
  console.log('🌱 POBLANDO MONGODB con datos de ejemplo\n');
  
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');
    
    // Crear modelos
    const SearchAnalytics = mongoose.model('SearchAnalytics', SearchAnalyticsSchema);
    const OrderItemMongo = mongoose.model('OrderItemMongo', OrderItemMongoSchema);
    
    // Limpiar colecciones existentes
    await SearchAnalytics.deleteMany({});
    await OrderItemMongo.deleteMany({});
    console.log('🧹 Colecciones limpiadas');
    
    // Insertar datos de search analytics
    await SearchAnalytics.insertMany(searchAnalyticsData);
    console.log(`✅ Insertados ${searchAnalyticsData.length} registros en searchanalytics`);
    
    // Insertar datos de order items
    await OrderItemMongo.insertMany(orderItemsData);
    console.log(`✅ Insertados ${orderItemsData.length} registros en orderitemmongos`);
    
    // Verificar resultado
    const searchCount = await SearchAnalytics.countDocuments();
    const orderItemsCount = await OrderItemMongo.countDocuments();
    
    console.log('\n📊 RESUMEN FINAL:');
    console.log(`   • searchanalytics: ${searchCount} documentos`);
    console.log(`   • orderitemmongos: ${orderItemsCount} documentos`);
    
    // Mostrar ejemplos de datos
    console.log('\n🔍 EJEMPLO - Búsquedas más frecuentes:');
    const topSearches = await SearchAnalytics.aggregate([
      { $group: { _id: '$query', count: { $sum: 1 }, avgResults: { $avg: '$resultsCount' } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);
    topSearches.forEach(search => {
      console.log(`   • "${search._id}" - ${search.count} búsquedas, ${search.avgResults.toFixed(1)} resultados promedio`);
    });
    
    console.log('\n📦 EJEMPLO - Productos más vendidos:');
    const topProducts = await OrderItemMongo.aggregate([
      { $group: { _id: '$productName', totalQuantity: { $sum: '$quantity' }, totalRevenue: { $sum: '$subtotal' } } },
      { $sort: { totalQuantity: -1 } },
      { $limit: 3 }
    ]);
    topProducts.forEach(product => {
      console.log(`   • ${product._id} - ${product.totalQuantity} unidades, $${product.totalRevenue.toFixed(2)} ingresos`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 Desconectado de MongoDB');
  }
}

populateMongoDB().catch(console.error);
