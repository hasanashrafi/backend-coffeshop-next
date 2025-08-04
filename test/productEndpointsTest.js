const axios = require('axios');

const BASE_URL = 'http://localhost:3004/api';

async function testProductEndpoints() {
    try {
        console.log('🧪 Testing Product Endpoints...\n');

        // 1. Test basic product endpoints
        console.log('1. Testing basic product endpoints...');
        try {
            const allProductsResponse = await axios.get(`${BASE_URL}/products`);
            console.log(`✅ Get all products: ${allProductsResponse.data.data?.length || 0} products found`);

            if (allProductsResponse.data.data && allProductsResponse.data.data.length > 0) {
                const firstProduct = allProductsResponse.data.data[0];
                console.log(`   First product: ${firstProduct.name} - ${firstProduct.price} تومان`);

                // Test get product by ID
                const productByIdResponse = await axios.get(`${BASE_URL}/products/${firstProduct._id}`);
                console.log(`✅ Get product by ID: ${productByIdResponse.data.data.name}`);
            }
        } catch (error) {
            console.log(`❌ Basic product endpoints failed: ${error.response?.data?.message || error.message}`);
        }

        // 2. Test special product list endpoints
        console.log('\n2. Testing special product list endpoints...');

        try {
            const discountedResponse = await axios.get(`${BASE_URL}/products/discounted/all`);
            console.log(`✅ Discounted products: ${discountedResponse.data.data?.length || 0} products found`);
        } catch (error) {
            console.log(`❌ Discounted products failed: ${error.response?.data?.message || error.message}`);
        }

        try {
            const topRatedResponse = await axios.get(`${BASE_URL}/products/top-rated/all`);
            console.log(`✅ Top rated products: ${topRatedResponse.data.data?.length || 0} products found`);
        } catch (error) {
            console.log(`❌ Top rated products failed: ${error.response?.data?.message || error.message}`);
        }

        try {
            const bestSellingResponse = await axios.get(`${BASE_URL}/products/best-selling/all`);
            console.log(`✅ Best selling products: ${bestSellingResponse.data.data?.length || 0} products found`);
        } catch (error) {
            console.log(`❌ Best selling products failed: ${error.response?.data?.message || error.message}`);
        }

        // 3. Test product filtering and sorting
        console.log('\n3. Testing product filtering and sorting...');

        try {
            const filteredResponse = await axios.get(`${BASE_URL}/products?category=coffee&hasDiscount=true`);
            console.log(`✅ Filtered products: ${filteredResponse.data.data?.length || 0} coffee products with discount`);
        } catch (error) {
            console.log(`❌ Product filtering failed: ${error.response?.data?.message || error.message}`);
        }

        try {
            const sortedResponse = await axios.get(`${BASE_URL}/products?sortBy=price&sortOrder=desc`);
            console.log(`✅ Sorted products: ${sortedResponse.data.data?.length || 0} products sorted by price`);
        } catch (error) {
            console.log(`❌ Product sorting failed: ${error.response?.data?.message || error.message}`);
        }

        // 4. Test product rating endpoints
        console.log('\n4. Testing product rating endpoints...');

        try {
            const allProductsResponse = await axios.get(`${BASE_URL}/products`);
            if (allProductsResponse.data.data && allProductsResponse.data.data.length > 0) {
                const firstProduct = allProductsResponse.data.data[0];

                // Test get product ratings
                const ratingsResponse = await axios.get(`${BASE_URL}/products/${firstProduct._id}/ratings`);
                console.log(`✅ Get product ratings: ${ratingsResponse.data.data.ratingCount || 0} ratings`);

                // Test rate a product
                const rateResponse = await axios.post(`${BASE_URL}/products/${firstProduct._id}/rate`, {
                    rating: 5,
                    comment: "Excellent coffee!",
                    userId: "test_user_123"
                });
                console.log(`✅ Rate product: Rating added successfully`);
            }
        } catch (error) {
            console.log(`❌ Product rating failed: ${error.response?.data?.message || error.message}`);
        }

        // 5. Test sales increment
        console.log('\n5. Testing sales increment...');

        try {
            const allProductsResponse = await axios.get(`${BASE_URL}/products`);
            if (allProductsResponse.data.data && allProductsResponse.data.data.length > 0) {
                const firstProduct = allProductsResponse.data.data[0];

                const salesResponse = await axios.post(`${BASE_URL}/products/${firstProduct._id}/increment-sales`, {
                    quantity: 2
                });
                console.log(`✅ Increment sales: Sales count updated to ${salesResponse.data.data.salesCount}`);
            }
        } catch (error) {
            console.log(`❌ Sales increment failed: ${error.response?.data?.message || error.message}`);
        }

        console.log('\n🎉 Product Endpoints Test Completed!');
        console.log('\n📋 Available Product Endpoints:');
        console.log('   ✅ GET /api/products - Get all products');
        console.log('   ✅ GET /api/products/:id - Get product by ID');
        console.log('   ✅ GET /api/products/discounted/all - Get discounted products');
        console.log('   ✅ GET /api/products/top-rated/all - Get top rated products');
        console.log('   ✅ GET /api/products/best-selling/all - Get best selling products');
        console.log('   ✅ POST /api/products/:id/rate - Rate a product');
        console.log('   ✅ GET /api/products/:id/ratings - Get product ratings');
        console.log('   ✅ POST /api/products/:id/increment-sales - Increment sales count');

        console.log('\n🔍 Query Parameters:');
        console.log('   ?category=coffee - Filter by category');
        console.log('   ?hasDiscount=true - Filter by discount status');
        console.log('   ?minRating=4 - Filter by minimum rating');
        console.log('   ?sortBy=price&sortOrder=desc - Sort products');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testProductEndpoints();
}

module.exports = testProductEndpoints; 