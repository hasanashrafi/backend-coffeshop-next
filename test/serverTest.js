const axios = require('axios');

const BASE_URL = 'https://backend-coffeshop-next.onrender.com';

async function testServer() {
    console.log('Testing server endpoints...\n');

    try {
        // Test 1: Root endpoint
        console.log('1. Testing root endpoint...');
        const rootResponse = await axios.get(`${BASE_URL}/api/`);
        console.log('✅ Root endpoint working:', rootResponse.data.message);
    } catch (error) {
        console.log('❌ Root endpoint failed:', error.response?.status, error.response?.statusText);
    }

    try {
        // Test 2: Health check
        console.log('\n2. Testing health endpoint...');
        const healthResponse = await axios.get(`${BASE_URL}/api/health`);
        console.log('✅ Health endpoint working:', healthResponse.data.status);
    } catch (error) {
        console.log('❌ Health endpoint failed:', error.response?.status, error.response?.statusText);
    }

    try {
        // Test 3: Products test endpoint
        console.log('\n3. Testing products test endpoint...');
        const productsTestResponse = await axios.get(`${BASE_URL}/api/products/test`);
        console.log('✅ Products test endpoint working:', productsTestResponse.data.message);
    } catch (error) {
        console.log('❌ Products test endpoint failed:', error.response?.status, error.response?.statusText);
    }

    try {
        // Test 4: CORS preflight for products
        console.log('\n4. Testing CORS preflight for products...');
        const preflightResponse = await axios.options(`${BASE_URL}/api/products`, {
            headers: {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        });
        console.log('✅ CORS preflight working:', preflightResponse.status);
        console.log('CORS headers:', {
            'Access-Control-Allow-Origin': preflightResponse.headers['access-control-allow-origin'],
            'Access-Control-Allow-Methods': preflightResponse.headers['access-control-allow-methods'],
            'Access-Control-Allow-Headers': preflightResponse.headers['access-control-allow-headers']
        });
    } catch (error) {
        console.log('❌ CORS preflight failed:', error.response?.status, error.response?.statusText);
    }

    try {
        // Test 5: Actual products endpoint
        console.log('\n5. Testing actual products endpoint...');
        const productsResponse = await axios.get(`${BASE_URL}/api/products`, {
            headers: {
                'Origin': 'http://localhost:3000'
            }
        });
        console.log('✅ Products endpoint working:', productsResponse.data.success);
        console.log('Products count:', productsResponse.data.count);
    } catch (error) {
        console.log('❌ Products endpoint failed:', error.response?.status, error.response?.statusText);
        if (error.response?.data) {
            console.log('Error details:', error.response.data);
        }
    }

} catch (error) {
    console.log('❌ Network error:', error.message);
}

testServer(); 