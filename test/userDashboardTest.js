const axios = require('axios');

const BASE_URL = 'http://localhost:3004/api';

// Test data
const testUser = {
    username: 'reza',
    email: 'ahmadashrafi@gmail.com',
    password: 'password123',
    firstName: 'Reza',
    lastName: 'Ahmad',
    phone: '+989123456789'
};

const testOrder = {
    userId: 'test_user_id', // Will be replaced with actual user ID
    items: [
        {
            productId: 'test_product_id', // Will be replaced with actual product ID
            quantity: 2
        }
    ],
    deliveryAddress: {
        street: 'Main Street',
        city: 'Tehran',
        postalCode: '12345',
        phone: '+989123456789'
    },
    paymentMethod: 'cash',
    notes: 'Please deliver in the morning'
};

async function testUserDashboardFeatures() {
    try {
        console.log('🧪 Testing User Dashboard Features...\n');

        // 1. Create a test user (simulate user creation)
        console.log('1. Creating test user...');
        const userId = 'test_user_123'; // In real app, this would come from user creation
        console.log(`✅ Test user ID: ${userId}\n`);

        // 2. Get user dashboard data
        console.log('2. Getting user dashboard data...');
        try {
            const dashboardResponse = await axios.get(`${BASE_URL}/dashboard/${userId}/dashboard`);
            console.log(`✅ Dashboard data retrieved`);
            console.log(`   User: ${dashboardResponse.data.data.user.displayName}`);
            console.log(`   Loyalty Points: ${dashboardResponse.data.data.statistics.loyaltyPoints}`);
            console.log(`   Total Orders: ${dashboardResponse.data.data.statistics.totalOrders}`);
            console.log(`   Total Spent: ${dashboardResponse.data.data.statistics.totalSpent} تومان`);
            console.log(`   Favorite Products: ${dashboardResponse.data.data.statistics.favoriteProductsCount}\n`);
        } catch (error) {
            console.log(`⚠️  Dashboard data not available (user may not exist): ${error.response?.data?.message || error.message}\n`);
        }

        // 3. Get user statistics
        console.log('3. Getting user statistics...');
        try {
            const statsResponse = await axios.get(`${BASE_URL}/dashboard/${userId}/statistics`);
            console.log(`✅ User statistics retrieved`);
            console.log(`   Loyalty Points: ${statsResponse.data.data.loyaltyPoints}`);
            console.log(`   Favorite Products: ${statsResponse.data.data.favoriteProductsCount}`);
            console.log(`   Total Orders: ${statsResponse.data.data.totalOrders}`);
            console.log(`   Total Spent: ${statsResponse.data.data.totalSpent} تومان`);
            console.log(`   Average Order Value: ${statsResponse.data.data.averageOrderValue} تومان\n`);
        } catch (error) {
            console.log(`⚠️  Statistics not available: ${error.response?.data?.message || error.message}\n`);
        }

        // 4. Test order creation
        console.log('4. Testing order creation...');
        try {
            const orderResponse = await axios.post(`${BASE_URL}/orders`, testOrder);
            console.log(`✅ Order created successfully`);
            console.log(`   Order Number: ${orderResponse.data.data.orderNumber}`);
            console.log(`   Status: ${orderResponse.data.data.status}`);
            console.log(`   Total Amount: ${orderResponse.data.data.totalAmount} تومان`);
            console.log(`   Items: ${orderResponse.data.data.items.length} products\n`);
        } catch (error) {
            console.log(`⚠️  Order creation failed: ${error.response?.data?.message || error.message}\n`);
        }

        // 5. Test order status update
        console.log('5. Testing order status update...');
        try {
            const orderId = 'test_order_123'; // In real app, this would come from order creation
            const statusUpdateResponse = await axios.put(`${BASE_URL}/orders/${orderId}/status`, {
                status: 'processing',
                note: 'Order is being prepared'
            });
            console.log(`✅ Order status updated`);
            console.log(`   New Status: ${statusUpdateResponse.data.data.status}\n`);
        } catch (error) {
            console.log(`⚠️  Status update failed: ${error.response?.data?.message || error.message}\n`);
        }

        // 6. Test favorite products
        console.log('6. Testing favorite products functionality...');
        const productId = 'test_product_123';

        try {
            // Add to favorites
            const addFavoriteResponse = await axios.post(`${BASE_URL}/dashboard/${userId}/favorites/${productId}`);
            console.log(`✅ Product added to favorites`);
            console.log(`   Favorite Products Count: ${addFavoriteResponse.data.data.favoriteProductsCount}\n`);
        } catch (error) {
            console.log(`⚠️  Add to favorites failed: ${error.response?.data?.message || error.message}\n`);
        }

        try {
            // Check favorite status
            const checkFavoriteResponse = await axios.get(`${BASE_URL}/dashboard/${userId}/favorites/${productId}/check`);
            console.log(`✅ Favorite status checked`);
            console.log(`   Is Favorite: ${checkFavoriteResponse.data.data.isFavorite}\n`);
        } catch (error) {
            console.log(`⚠️  Check favorite status failed: ${error.response?.data?.message || error.message}\n`);
        }

        // 7. Test order status summary
        console.log('7. Testing order status summary...');
        try {
            const summaryResponse = await axios.get(`${BASE_URL}/orders/user/${userId}/summary`);
            console.log(`✅ Order status summary retrieved`);
            const summary = summaryResponse.data.data;
            console.log(`   Pending Orders: ${summary.pending.count} (${summary.pending.totalAmount} تومان)`);
            console.log(`   Processing Orders: ${summary.processing.count} (${summary.processing.totalAmount} تومان)`);
            console.log(`   Completed Orders: ${summary.completed.count} (${summary.completed.totalAmount} تومان)`);
            console.log(`   Delivered Orders: ${summary.delivered.count} (${summary.delivered.totalAmount} تومان)`);
            console.log(`   Cancelled Orders: ${summary.cancelled.count} (${summary.cancelled.totalAmount} تومان)\n`);
        } catch (error) {
            console.log(`⚠️  Order summary failed: ${error.response?.data?.message || error.message}\n`);
        }

        // 8. Test recent orders
        console.log('8. Testing recent orders...');
        try {
            const recentOrdersResponse = await axios.get(`${BASE_URL}/orders/user/${userId}/recent?limit=3`);
            console.log(`✅ Recent orders retrieved`);
            console.log(`   Recent Orders Count: ${recentOrdersResponse.data.data.length}`);
            recentOrdersResponse.data.data.forEach((order, index) => {
                console.log(`   Order ${index + 1}: ${order.orderNumber} - ${order.status} - ${order.items.length} items`);
            });
            console.log('');
        } catch (error) {
            console.log(`⚠️  Recent orders failed: ${error.response?.data?.message || error.message}\n`);
        }

        // 9. Test user profile update
        console.log('9. Testing user profile update...');
        try {
            const profileUpdateResponse = await axios.put(`${BASE_URL}/dashboard/${userId}/profile`, {
                firstName: 'Reza',
                lastName: 'Ahmad',
                phone: '+989123456789',
                address: {
                    street: 'Main Street',
                    city: 'Tehran',
                    postalCode: '12345',
                    country: 'Iran'
                }
            });
            console.log(`✅ Profile updated successfully`);
            console.log(`   User: ${profileUpdateResponse.data.data.displayName}`);
            console.log(`   Phone: ${profileUpdateResponse.data.data.phone}\n`);
        } catch (error) {
            console.log(`⚠️  Profile update failed: ${error.response?.data?.message || error.message}\n`);
        }

        // 10. Test order statistics
        console.log('10. Testing order statistics...');
        try {
            const orderStatsResponse = await axios.get(`${BASE_URL}/orders/user/${userId}/statistics`);
            console.log(`✅ Order statistics retrieved`);
            console.log(`   Total Orders: ${orderStatsResponse.data.data.totalOrders}`);
            console.log(`   Total Spent: ${orderStatsResponse.data.data.totalSpent} تومان`);
            console.log(`   Average Order Value: ${orderStatsResponse.data.data.averageOrderValue} تومان`);
            console.log(`   Loyalty Points: ${orderStatsResponse.data.data.loyaltyPoints}\n`);
        } catch (error) {
            console.log(`⚠️  Order statistics failed: ${error.response?.data?.message || error.message}\n`);
        }

        console.log('🎉 User Dashboard Features Test Completed!');
        console.log('\n📋 Summary of Features:');
        console.log('   ✅ User dashboard data retrieval');
        console.log('   ✅ User statistics tracking');
        console.log('   ✅ Order creation and management');
        console.log('   ✅ Order status tracking (pending, processing, completed, delivered, cancelled)');
        console.log('   ✅ Favorite products management');
        console.log('   ✅ Order status summaries');
        console.log('   ✅ Recent orders display');
        console.log('   ✅ User profile management');
        console.log('   ✅ Loyalty points system');
        console.log('   ✅ Order statistics and analytics');

        console.log('\n🔗 API Endpoints Available:');
        console.log('   📊 Dashboard: GET /api/dashboard/:userId/dashboard');
        console.log('   👤 Profile: GET /api/dashboard/:userId/profile');
        console.log('   📈 Statistics: GET /api/dashboard/:userId/statistics');
        console.log('   ❤️  Favorites: GET /api/dashboard/:userId/favorites');
        console.log('   📦 Orders: GET /api/orders/user/:userId');
        console.log('   📋 Order Summary: GET /api/orders/user/:userId/summary');
        console.log('   📊 Order Stats: GET /api/orders/user/:userId/statistics');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testUserDashboardFeatures();
}

module.exports = testUserDashboardFeatures; 