const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testUserOrders() {
  try {
    console.log('🧪 Testing User Orders API...');
    
    // First, try to login to get a user
    console.log('\n📝 Creating test user...');
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    let userId;
    let token;

    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
      console.log('✅ User created successfully');
      
      // Login to get token
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        identifier: testUser.email,
        password: testUser.password
      });
      
      token = loginResponse.data.access_token;
      userId = loginResponse.data.user.id;
      console.log('✅ User logged in successfully');
      console.log('👤 User ID:', userId);
      
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️  User already exists, trying to login...');
        
        // Try to login
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          identifier: testUser.email,
          password: testUser.password
        });
        
        token = loginResponse.data.access_token;
        userId = loginResponse.data.user.id;
        console.log('✅ User logged in successfully');
        console.log('👤 User ID:', userId);
      } else {
        throw error;
      }
    }

    // Test getting user orders
    console.log('\n📦 Testing get user orders...');
    
    const response = await axios.get(`${API_BASE_URL}/orders/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ User orders fetched successfully');
    console.log('📊 Response status:', response.status);
    console.log('📦 Orders found:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('📋 Sample order:', JSON.stringify(response.data[0], null, 2));
    } else {
      console.log('ℹ️  No orders found for this user (this is normal for a new user)');
    }

    console.log('\n✅ User orders API test completed successfully! 🎉');
    
  } catch (error) {
    console.error('\n❌ Error testing user orders API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testUserOrders();
