require('dotenv').config();

console.log('🗄️ DATABASE STRUCTURE AUDIT');
console.log('==================================================');

console.log('\n📋 CONFIGURED ENTITIES IN TYPEORM:');
console.log('PostgreSQL Tables (from app.module.ts):');
console.log('   • categories');
console.log('   • products'); 
console.log('   • users');
console.log('   • orders');
console.log('   • order_items');

console.log('\n📋 CONFIGURED MONGODB SCHEMAS:');
console.log('Only using SearchAnalytics schema in analytics module');
console.log('   • searchanalytics (collection)');

console.log('\n📋 UNUSED/EXTRA SCHEMA FILES:');
console.log('Found mongo.schemas.ts with many unused schemas:');
console.log('   • UserSession');
console.log('   • ProductAnalytics'); 
console.log('   • SearchLog');
console.log('   • UserBehavior');
console.log('   • CartSession');
console.log('   • ProductReview');
console.log('   • Notification');
console.log('   • AuditLog');

console.log('\n🎯 RECOMMENDATIONS:');
console.log('✅ PostgreSQL: Clean structure with only needed tables');
console.log('❌ MongoDB: Remove unused schemas and collections');
console.log('❌ Clean up unused mongo.schemas.ts file');

console.log('\n==================================================');
console.log('✅ Audit completed!');
