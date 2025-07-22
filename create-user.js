const axios = require('axios');

const API_BASE_URL = 'https://damihvi.onrender.com/api';

async function createUser() {
  try {
    console.log('Intentando crear usuario...');
    
    const userData = {
      username: 'damian',
      email: 'dami-an12@outlook.com',
      password: 'damian12.'
    };

    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    
    console.log('Usuario creado exitosamente:');
    console.log('Token:', response.data.data.token);
    console.log('Usuario:', response.data.data.user);
    
  } catch (error) {
    if (error.response) {
      console.log('Error del servidor:', error.response.status);
      console.log('Mensaje:', error.response.data);
    } else {
      console.log('Error de conexión:', error.message);
    }
  }
}

async function testLogin() {
  try {
    console.log('\nIntentando hacer login...');
    
    const loginData = {
      identifier: 'dami-an12@outlook.com',
      password: 'damian12.'
    };

    const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    
    console.log('Login exitoso:');
    console.log('Token:', response.data.data.token);
    console.log('Usuario:', response.data.data.user);
    
  } catch (error) {
    if (error.response) {
      console.log('Error del servidor:', error.response.status);
      console.log('Mensaje:', error.response.data);
    } else {
      console.log('Error de conexión:', error.message);
    }
  }
}

async function main() {
  await createUser();
  await testLogin();
}

main().catch(console.error);
