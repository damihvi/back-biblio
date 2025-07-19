const https = require('https');

const BASE_URL = 'https://damihvi.onrender.com/api';

function testEndpoint(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 45000
    };

    const req = https.request(url, options, (res) => {
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

async function testBackend() {
  console.log('🚀 Probando backend en Render...\n');
  
  const tests = [
    { name: 'Health Check', endpoint: '/' },
    { name: 'Products', endpoint: '/products' },
    { name: 'Categories', endpoint: '/categories' },
  ];

  for (const test of tests) {
    try {
      console.log(`⏳ Probando ${test.name}...`);
      const result = await testEndpoint(test.endpoint);
      
      if (result.status === 200) {
        console.log(`✅ ${test.name}: OK (${result.status})`);
        if (test.name === 'Products' && Array.isArray(result.data)) {
          console.log(`   📦 ${result.data.length} productos encontrados`);
        }
        if (test.name === 'Categories' && Array.isArray(result.data)) {
          console.log(`   📁 ${result.data.length} categorías encontradas`);
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

testBackend().catch(console.error);
