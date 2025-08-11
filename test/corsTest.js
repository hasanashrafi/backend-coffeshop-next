const axios = require('axios');

async function testCORS() {
    const baseURL = 'https://backend-coffeshop-next.onrender.com';

    try {
        console.log('Testing CORS with preflight request...');

        // Test preflight request
        const preflightResponse = await axios.options(`${baseURL}/api/products`, {
            headers: {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type, Authorization'
            }
        });

        console.log('Preflight response status:', preflightResponse.status);
        console.log('Preflight response headers:', preflightResponse.headers);

        // Test actual GET request
        const getResponse = await axios.get(`${baseURL}/api/products`, {
            headers: {
                'Origin': 'http://localhost:3000'
            }
        });

        console.log('GET response status:', getResponse.status);
        console.log('GET response headers:', getResponse.headers);
        console.log('Data received:', getResponse.data.success);

    } catch (error) {
        console.error('CORS test failed:', error.response?.status, error.response?.statusText);
        console.error('Error details:', error.response?.data);
    }
}

testCORS(); 