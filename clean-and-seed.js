const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function cleanAndSeed() {
  try {
    console.log('🧹 Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // 1. LIMPIAR TODAS LAS TABLAS (en orden correcto para respetar foreign keys)
    console.log('\n🗑️ Limpiando todas las tablas...');
    
    const cleanQueries = [
      'DELETE FROM order_items;',
      'DELETE FROM orders;',
      'DELETE FROM cart_items;',
      'DELETE FROM review_helpfulness;',
      'DELETE FROM reviews;',
      'DELETE FROM wishlist_items;',
      'DELETE FROM coupon_usages;',
      'DELETE FROM coupons;',
      'DELETE FROM inventory_movements;',
      'DELETE FROM stock_alerts;',
      'DELETE FROM notifications;',
      'DELETE FROM analytics_events;',
      'DELETE FROM files;',
      'DELETE FROM products;',
      'DELETE FROM categories;',
      'DELETE FROM users;',
      'DELETE FROM posts;',
      'DELETE FROM category;'
    ];

    for (const query of cleanQueries) {
      try {
        await client.query(query);
        console.log(`✅ ${query}`);
      } catch (error) {
        console.log(`⚠️ ${query} - ${error.message}`);
      }
    }

    // 2. CREAR CATEGORÍAS FRESCAS
    console.log('\n📁 Creando categorías...');
    const categories = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Electrónicos',
        description: 'Dispositivos electrónicos y gadgets',
        slug: 'electronicos',
        isActive: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002', 
        name: 'Ropa',
        description: 'Vestimenta y accesorios',
        slug: 'ropa',
        isActive: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Hogar',
        description: 'Artículos para el hogar',
        slug: 'hogar',
        isActive: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Deportes',
        description: 'Equipamiento deportivo',
        slug: 'deportes',
        isActive: true
      }
    ];

    for (const category of categories) {
      await client.query(`
        INSERT INTO categories (id, name, description, slug, "isActive")
        VALUES ($1, $2, $3, $4, $5)
      `, [category.id, category.name, category.description, category.slug, category.isActive]);
      console.log(`✅ Categoría creada: ${category.name}`);
    }

    // 3. CREAR USUARIOS FRESCOS
    console.log('\n👥 Creando usuarios...');
    const users = [
      {
        id: '550e8400-e29b-41d4-a716-446655441001',
        username: 'admin',
        email: 'admin@test.com',
        password: 'YWRtaW4xMjNzaW1wbGUtc2FsdA==', // admin123 hasheado
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        phone: '+1234567890'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655441002',
        username: 'testuser',
        email: 'user@test.com', 
        password: 'dXNlcjEyM3NpbXBsZS1zYWx0', // user123 hasheado
        firstName: 'Test',
        lastName: 'User',
        role: 'customer',
        isActive: true,
        phone: '+0987654321'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655441003',
        username: 'seller1',
        email: 'seller@test.com',
        password: 'c2VsbGVyMTIzc2ltcGxlLXNhbHQ=', // seller123 hasheado
        firstName: 'Seller',
        lastName: 'User', 
        role: 'seller',
        isActive: true,
        phone: '+1122334455'
      }
    ];

    for (const user of users) {
      await client.query(`
        INSERT INTO users (id, username, email, password, "firstName", "lastName", role, "isActive", phone, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      `, [user.id, user.username, user.email, user.password, user.firstName, user.lastName, user.role, user.isActive, user.phone]);
      console.log(`✅ Usuario creado: ${user.username} (${user.email})`);
    }

    // 4. CREAR PRODUCTOS FRESCOS
    console.log('\n📦 Creando productos...');
    const products = [
      {
        id: '550e8400-e29b-41d4-a716-446655442001',
        name: 'iPhone 15 Pro',
        description: 'El último iPhone con chip A17 Pro',
        sku: 'IPHONE-15-PRO-001',
        price: 999.99,
        stock: 50,
        categoryId: '550e8400-e29b-41d4-a716-446655440001', // Electrónicos
        isActive: true,
        brand: 'Apple',
        image: 'https://example.com/iphone15.jpg'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655442002',
        name: 'Samsung Galaxy S24',
        description: 'Smartphone Android de última generación',
        sku: 'SAMSUNG-S24-001',
        price: 899.99,
        stock: 30,
        categoryId: '550e8400-e29b-41d4-a716-446655440001', // Electrónicos
        isActive: true,
        brand: 'Samsung',
        image: 'https://example.com/galaxys24.jpg'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655442003',
        name: 'Camiseta Nike Deportiva',
        description: 'Camiseta para entrenamientos y deportes',
        sku: 'NIKE-SHIRT-001',
        price: 29.99,
        stock: 100,
        categoryId: '550e8400-e29b-41d4-a716-446655440002', // Ropa
        isActive: true,
        brand: 'Nike',
        image: 'https://example.com/nike-shirt.jpg'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655442004',
        name: 'Zapatillas Adidas Running',
        description: 'Zapatillas para correr con tecnología Boost',
        sku: 'ADIDAS-RUN-001',
        price: 129.99,
        stock: 75,
        categoryId: '550e8400-e29b-41d4-a716-446655440004', // Deportes
        isActive: true,
        brand: 'Adidas',
        image: 'https://example.com/adidas-run.jpg'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655442005',
        name: 'Aspiradora Robot',
        description: 'Aspiradora inteligente con mapeo láser',
        sku: 'ROBOT-VAC-001',
        price: 299.99,
        stock: 25,
        categoryId: '550e8400-e29b-41d4-a716-446655440003', // Hogar
        isActive: true,
        brand: 'Roomba',
        image: 'https://example.com/roomba.jpg'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655442006',
        name: 'MacBook Air M3',
        description: 'Laptop ultradelgada con chip M3',
        sku: 'MACBOOK-AIR-M3-001',
        price: 1299.99,
        stock: 20,
        categoryId: '550e8400-e29b-41d4-a716-446655440001', // Electrónicos
        isActive: true,
        brand: 'Apple',
        image: 'https://example.com/macbook-air.jpg'
      }
    ];

    for (const product of products) {
      await client.query(`
        INSERT INTO products (id, name, description, sku, price, stock, "categoryId", "isActive", brand, image, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      `, [product.id, product.name, product.description, product.sku, product.price, product.stock, product.categoryId, product.isActive, product.brand, product.image]);
      console.log(`✅ Producto creado: ${product.name} (${product.sku})`);
    }

    // 5. VERIFICAR DATOS CREADOS
    console.log('\n📊 Verificando datos creados...');
    
    const categoriesCount = await client.query('SELECT COUNT(*) FROM categories');
    console.log(`📁 Categorías: ${categoriesCount.rows[0].count}`);
    
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    console.log(`👥 Usuarios: ${usersCount.rows[0].count}`);
    
    const productsCount = await client.query('SELECT COUNT(*) FROM products');
    console.log(`📦 Productos: ${productsCount.rows[0].count}`);

    // 6. MOSTRAR ALGUNOS DATOS PARA VERIFICAR
    console.log('\n🔍 Muestra de datos creados:');
    
    const sampleProducts = await client.query(`
      SELECT p.name, p.sku, p.price, c.name as category_name 
      FROM products p 
      JOIN categories c ON p."categoryId" = c.id 
      LIMIT 3
    `);
    
    sampleProducts.rows.forEach(product => {
      console.log(`📦 ${product.name} (${product.sku}) - $${product.price} - ${product.category_name}`);
    });

    console.log('\n✅ ¡Limpieza y siembra completada exitosamente!');
    console.log('\n🎯 Datos de prueba para usar:');
    console.log('👤 Admin: admin@test.com / admin123');
    console.log('👤 Customer: user@test.com / user123');
    console.log('👤 Seller: seller@test.com / seller123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada');
  }
}

cleanAndSeed();
