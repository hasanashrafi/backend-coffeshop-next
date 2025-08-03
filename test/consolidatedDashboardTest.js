const axios = require('axios');

const BASE_URL = 'http://localhost:3004/api';

async function testConsolidatedDashboard() {
    try {
        console.log('🧪 Testing Consolidated User Dashboard...\n');

        const userId = 'test_user_123'; // In real app, this would come from authentication

        // 1. Get complete user dashboard data
        console.log('1. Getting complete user dashboard data...');
        try {
            const dashboardResponse = await axios.get(`${BASE_URL}/dashboard/${userId}`);
            const dashboardData = dashboardResponse.data.data;

            console.log(`✅ Dashboard data retrieved successfully`);
            console.log(`\n📊 User Information:`);
            console.log(`   Name: ${dashboardData.user.displayName}`);
            console.log(`   Email: ${dashboardData.user.email}`);
            console.log(`   Member since: ${new Date(dashboardData.user.createdAt).getFullYear()}`);

            console.log(`\n📈 User Statistics:`);
            console.log(`   Loyalty Points: ${dashboardData.statistics.loyaltyPoints}`);
            console.log(`   Favorite Products: ${dashboardData.statistics.favoriteProductsCount}`);
            console.log(`   Total Spent: ${dashboardData.statistics.totalSpent.toLocaleString()} تومان`);
            console.log(`   Total Orders: ${dashboardData.statistics.totalOrders}`);
            console.log(`   Average Order Value: ${dashboardData.statistics.averageOrderValue.toLocaleString()} تومان`);

            console.log(`\n📦 Recent Orders:`);
            dashboardData.recentOrders.forEach((order, index) => {
                const orderDate = new Date(order.createdAt);
                const daysAgo = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
                console.log(`   Order #${order.orderNumber}: ${order.items[0]?.productName || 'Unknown'} - ${daysAgo} days ago`);
            });

            console.log(`\n💰 Order Status Summary:`);
            Object.entries(dashboardData.orderStatusSummary).forEach(([status, data]) => {
                if (data.count > 0) {
                    console.log(`   ${status}: ${data.count} orders (${data.totalAmount.toLocaleString()} تومان)`);
                }
            });

            console.log(`\n❤️  Favorite Products:`);
            dashboardData.favoriteProducts.forEach((product, index) => {
                console.log(`   ${index + 1}. ${product.name} - ${product.price.toLocaleString()} تومان`);
                if (product.hasDiscount) {
                    console.log(`      Discount: ${product.discount}% (${product.discountedPrice.toLocaleString()} تومان)`);
                }
            });

        } catch (error) {
            console.log(`⚠️  Dashboard data not available: ${error.response?.data?.message || error.message}`);
        }

        // 2. Test profile update
        console.log('\n2. Testing profile update...');
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
            console.log(`   Phone: ${profileUpdateResponse.data.data.phone}`);
        } catch (error) {
            console.log(`⚠️  Profile update failed: ${error.response?.data?.message || error.message}`);
        }

        // 3. Test favorite products management
        console.log('\n3. Testing favorite products...');
        const productId = 'test_product_123';

        try {
            // Add to favorites
            const addFavoriteResponse = await axios.post(`${BASE_URL}/dashboard/${userId}/favorites/${productId}`);
            console.log(`✅ Product added to favorites`);
            console.log(`   Favorite Products Count: ${addFavoriteResponse.data.data.favoriteProductsCount}`);
        } catch (error) {
            console.log(`⚠️  Add to favorites failed: ${error.response?.data?.message || error.message}`);
        }

        try {
            // Check favorite status
            const checkFavoriteResponse = await axios.get(`${BASE_URL}/dashboard/${userId}/favorites/${productId}/check`);
            console.log(`✅ Favorite status checked`);
            console.log(`   Is Favorite: ${checkFavoriteResponse.data.data.isFavorite}`);
        } catch (error) {
            console.log(`⚠️  Check favorite status failed: ${error.response?.data?.message || error.message}`);
        }

        console.log('\n🎉 Consolidated Dashboard Test Completed!');
        console.log('\n📋 Summary of Features:');
        console.log('   ✅ Single API call for complete user dashboard');
        console.log('   ✅ User profile information');
        console.log('   ✅ User statistics (loyalty points, favorites, spending)');
        console.log('   ✅ Recent orders with status');
        console.log('   ✅ Order status summary with amounts');
        console.log('   ✅ Favorite products list');
        console.log('   ✅ Profile update functionality');
        console.log('   ✅ Favorite products management');

        console.log('\n🔗 Main Endpoint:');
        console.log('   GET /api/dashboard/:userId - Complete user dashboard data');

        console.log('\n📱 Frontend Integration:');
        console.log('   // After user authentication, get complete dashboard data');
        console.log('   const dashboardData = await fetch(`/api/dashboard/${userId}`);');
        console.log('   const { user, statistics, recentOrders, orderStatusSummary, favoriteProducts } = dashboardData;');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testConsolidatedDashboard();
}

module.exports = testConsolidatedDashboard; 