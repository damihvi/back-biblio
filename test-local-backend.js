const https = require('https');

const BASE_URL = 'http://localhost:3101/api';

function testEndpoint(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const http = require('http'); // Para localhost
    const url = new URL(endpoint, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ 
            status: res.statusCode, 
            data: json,
            endpoint
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data: body,
            endpoint
          });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout en ${endpoint}`));
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testLocalBackend() {
  console.log('🚀 Probando backend local con datos frescos...\n');
  
  const tests = [
    { name: 'Health Check', endpoint: '/api' },
    { name: 'Products', endpoint: '/api/products' },
    { name: 'Categories', endpoint: '/api/categories' },
    { 
      name: 'Login Admin', 
      endpoint: '/api/auth/login',
      method: 'POST',
      data: { identifier: 'admin@test.com', password: 'admin123' }
    },
    { 
      name: 'Login Customer', 
      endpoint: '/api/auth/login',
      method: 'POST',
      data: { identifier: 'user@test.com', password: 'user123' }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`⏳ Probando ${test.name}...`);
      const result = await testEndpoint(test.endpoint, test.method, test.data);
      
      if (result.status === 200 || result.status === 201) {
        console.log(`✅ ${test.name}: OK (${result.status})`);
        if (test.name === 'Products' && result.data.data && Array.isArray(result.data.data)) {
          console.log(`   📦 ${result.data.data.length} productos encontrados`);
          result.data.data.slice(0, 2).forEach(p => {
            console.log(`      - ${p.name} ($${p.price}) - ${p.sku}`);
          });
        }
        if (test.name === 'Categories' && result.data.data && Array.isArray(result.data.data)) {
          console.log(`   📁 ${result.data.data.length} categorías encontradas`);
          result.data.data.forEach(c => {
            console.log(`      - ${c.name} (${c.slug})`);
          });
        }
        if (test.name.includes('Login') && result.data.data && result.data.data.user) {
          const user = result.data.data.user;
          console.log(`   👤 Login exitoso: ${user.username} (${user.role})`);
        }
      } else {
        console.log(`❌ ${test.name}: Error ${result.status}`);
        console.log(`   Error: ${JSON.stringify(result.data, null, 2)}`);
      }
    } catch (error) {
      console.log(`💥 ${test.name}: ${error.message}`);
    }
    console.log('');
  }
}

testLocalBackend().catch(console.error);
