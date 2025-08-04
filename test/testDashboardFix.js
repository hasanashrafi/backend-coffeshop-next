const axios = require('axios');

const BASE_URL = 'http://localhost:3004/api';

async function testDashboardFix() {
    try {
        console.log('🧪 Testing Dashboard Endpoint Fix...\n');

        // Test 1: Invalid user ID format
        console.log('1. Testing invalid user ID format...');
        try {
            const response = await axios.get(`${BASE_URL}/dashboard/invalid-id`);
            console.log(`❌ Should have failed but got: ${response.status}`);
        } catch (error) {
            if (error.response?.status === 400) {
                console.log(`✅ Correctly rejected invalid ID: ${error.response.data.message}`);
            } else {
                console.log(`❌ Unexpected error: ${error.response?.data?.message || error.message}`);
            }
        }

        // Test 2: Missing user ID
        console.log('\n2. Testing missing user ID...');
        try {
            const response = await axios.get(`${BASE_URL}/dashboard/`);
            console.log(`❌ Should have failed but got: ${response.status}`);
        } catch (error) {
            if (error.response?.status === 404) {
                console.log(`✅ Correctly handled missing ID (404 route not found)`);
            } else {
                console.log(`❌ Unexpected error: ${error.response?.data?.message || error.message}`);
            }
        }

        // Test 3: Valid user ID format but non-existent user
        console.log('\n3. Testing valid format but non-existent user...');
        try {
            const response = await axios.get(`${BASE_URL}/dashboard/507f1f77bcf86cd799439011`);
            if (response.status === 404) {
                console.log(`✅ Correctly handled non-existent user: ${response.data.message}`);
            } else {
                console.log(`❌ Unexpected response: ${response.status}`);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log(`✅ Correctly handled non-existent user: ${error.response.data.message}`);
            } else {
                console.log(`❌ Unexpected error: ${error.response?.data?.message || error.message}`);
            }
        }

        // Test 4: Create a test user and test the endpoint
        console.log('\n4. Testing with a real user...');
        try {
            // First, let's create a test user
            const createUserResponse = await axios.post(`${BASE_URL}/users`, {
                username: 'testuser_dashboard',
                email: 'testuser_dashboard@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User'
            });

            if (createUserResponse.status === 201) {
                const userId = createUserResponse.data.data._id;
                console.log(`✅ Created test user with ID: ${userId}`);

                // Now test the dashboard endpoint
                const dashboardResponse = await axios.get(`${BASE_URL}/dashboard/${userId}`);

                if (dashboardResponse.status === 200) {
                    const data = dashboardResponse.data.data;
                    console.log(`✅ Dashboard endpoint works!`);
                    console.log(`   User: ${data.user.username} (${data.user.fullName})`);
                    console.log(`   Statistics: ${data.statistics.totalOrders} orders, ${data.statistics.totalSpent} spent`);
                    console.log(`   Recent Orders: ${data.recentOrders.length} orders`);
                    console.log(`   Favorite Products: ${data.favoriteProducts.length} products`);

                    // Test the structure
                    const requiredFields = ['user', 'statistics', 'recentOrders', 'orderStatusSummary', 'favoriteProducts'];
                    const missingFields = requiredFields.filter(field => !data[field]);

                    if (missingFields.length === 0) {
                        console.log(`✅ All required fields present`);
                    } else {
                        console.log(`❌ Missing fields: ${missingFields.join(', ')}`);
                    }
                } else {
                    console.log(`❌ Dashboard request failed: ${dashboardResponse.status}`);
                }
            } else {
                console.log(`❌ Failed to create test user: ${createUserResponse.status}`);
            }
        } catch (error) {
            console.log(`❌ Error in real user test: ${error.response?.data?.message || error.message}`);
        }

        console.log('\n🎉 Dashboard Endpoint Fix Test Completed!');
        console.log('\n📋 What was fixed:');
        console.log('   ✅ Removed incorrect ObjectId constructor usage');
        console.log('   ✅ Added proper userId validation');
        console.log('   ✅ Added error handling for aggregation queries');
        console.log('   ✅ Added proper error responses for invalid IDs');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testDashboardFix();
}

module.exports = testDashboardFix; 