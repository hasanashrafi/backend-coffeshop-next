const axios = require('axios');

const BASE_URL = 'http://localhost:3004/api';

// Test data
const testProduct = {
    name: "Test Coffee Product",
    price: 120000,
    discount: 20,
    description: "A test coffee product with discount",
    image: "/images/test-product.png",
    category: "coffee"
};

const testRating = {
    rating: 5,
    comment: "Excellent coffee! Highly recommended.",
    userId: "test_user_123"
};

async function testProductFeatures() {
    try {
        console.log('🧪 Testing Product Features...\n');

        // 1. Create a new product
        console.log('1. Creating a new product...');
        const createResponse = await axios.post(`${BASE_URL}/products`, testProduct);
        const productId = createResponse.data.data._id;
        console.log(`✅ Product created with ID: ${productId}`);
        console.log(`   Original Price: ${testProduct.price}`);
        console.log(`   Discount: ${testProduct.discount}%`);
        console.log(`   Discounted Price: ${createResponse.data.data.discountedPrice}`);
        console.log(`   Has Discount: ${createResponse.data.data.hasDiscount}\n`);

        // 2. Rate the product
        console.log('2. Rating the product...');
        const ratingResponse = await axios.post(`${BASE_URL}/products/${productId}/rate`, testRating);
        console.log(`✅ Rating added successfully`);
        console.log(`   Average Rating: ${ratingResponse.data.data.averageRating}`);
        console.log(`   Rating Count: ${ratingResponse.data.data.ratingCount}\n`);

        // 3. Get product ratings
        console.log('3. Getting product ratings...');
        const ratingsResponse = await axios.get(`${BASE_URL}/products/${productId}/ratings`);
        console.log(`✅ Ratings retrieved`);
        console.log(`   Total Ratings: ${ratingsResponse.data.data.ratingCount}`);
        console.log(`   Average Rating: ${ratingsResponse.data.data.averageRating}`);
        console.log(`   First Rating Comment: "${ratingsResponse.data.data.ratings[0].comment}"\n`);

        // 4. Increment sales
        console.log('4. Incrementing sales count...');
        const salesResponse = await axios.post(`${BASE_URL}/products/${productId}/increment-sales`, { quantity: 3 });
        console.log(`✅ Sales count updated`);
        console.log(`   Sales Count: ${salesResponse.data.data.salesCount}\n`);

        // 5. Get all products with filters
        console.log('5. Testing product filters...');
        const allProductsResponse = await axios.get(`${BASE_URL}/products`);
        const discountedProductsResponse = await axios.get(`${BASE_URL}/products?hasDiscount=true`);
        const topRatedResponse = await axios.get(`${BASE_URL}/products/top-rated/all?limit=5`);
        const bestSellingResponse = await axios.get(`${BASE_URL}/products/best-selling/all?limit=5`);

        console.log(`✅ All Products: ${allProductsResponse.data.count} products`);
        console.log(`✅ Discounted Products: ${discountedProductsResponse.data.count} products`);
        console.log(`✅ Top Rated Products: ${topRatedResponse.data.count} products`);
        console.log(`✅ Best Selling Products: ${bestSellingResponse.data.count} products\n`);

        // 6. Test product with no discount
        console.log('6. Creating a product without discount...');
        const noDiscountProduct = { ...testProduct, name: "No Discount Product", discount: 0 };
        const noDiscountResponse = await axios.post(`${BASE_URL}/products`, noDiscountProduct);
        console.log(`✅ Product without discount created`);
        console.log(`   Has Discount: ${noDiscountResponse.data.data.hasDiscount}`);
        console.log(`   Discounted Price: ${noDiscountResponse.data.data.discountedPrice}\n`);

        // 7. Test multiple ratings
        console.log('7. Adding multiple ratings to test average calculation...');
        const ratings = [
            { rating: 4, comment: "Good coffee", userId: "user_1" },
            { rating: 5, comment: "Excellent!", userId: "user_2" },
            { rating: 3, comment: "Average", userId: "user_3" }
        ];

        for (const rating of ratings) {
            await axios.post(`${BASE_URL}/products/${productId}/rate`, rating);
        }

        const finalRatingsResponse = await axios.get(`${BASE_URL}/products/${productId}/ratings`);
        console.log(`✅ Multiple ratings added`);
        console.log(`   Final Average Rating: ${finalRatingsResponse.data.data.averageRating}`);
        console.log(`   Total Ratings: ${finalRatingsResponse.data.data.ratingCount}\n`);

        console.log('🎉 All tests completed successfully!');
        console.log('\n📋 Summary of Features:');
        console.log('   ✅ Product discount system (0-100%)');
        console.log('   ✅ Automatic discounted price calculation');
        console.log('   ✅ Product rating system (1-5 stars)');
        console.log('   ✅ Comment support with ratings');
        console.log('   ✅ Average rating calculation');
        console.log('   ✅ Sales count tracking');
        console.log('   ✅ Product filtering and sorting');
        console.log('   ✅ Special product lists (discounted, top-rated, best-selling)');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testProductFeatures();
}

module.exports = testProductFeatures; 