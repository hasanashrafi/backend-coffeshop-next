const fs = require('fs').promises;
const path = require('path');

async function debugProducts() {
    try {
        console.log('🔍 Debugging Products Issue...\n');

        // 1. Check if db.json exists and has products
        console.log('1. Checking db.json file...');
        try {
            const dbPath = path.join(__dirname, '../db.json');
            const dbData = await fs.readFile(dbPath, 'utf8');
            const db = JSON.parse(dbData);

            console.log(`✅ db.json found with ${db.products?.length || 0} products`);

            if (db.products && db.products.length > 0) {
                console.log(`   First product: ${db.products[0].name}`);
                console.log(`   Last product: ${db.products[db.products.length - 1].name}`);
                console.log(`   Sample product structure:`, {
                    id: db.products[0].id,
                    name: db.products[0].name,
                    price: db.products[0].price,
                    discount: db.products[0].discount,
                    isActive: db.products[0].isActive
                });
            }
        } catch (error) {
            console.log(`❌ Error reading db.json: ${error.message}`);
        }

        // 2. Check MongoDB connection
        console.log('\n2. Checking MongoDB connection...');
        try {
            const mongoose = require('mongoose');
            console.log(`   MongoDB connection state: ${mongoose.connection.readyState}`);
            console.log(`   Connection states: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting`);

            if (mongoose.connection.readyState === 1) {
                console.log('   ✅ MongoDB is connected');

                // Try to count products in MongoDB
                const Product = require('../models/Product');
                const count = await Product.countDocuments();
                console.log(`   Products in MongoDB: ${count}`);

                if (count > 0) {
                    const sampleProduct = await Product.findOne();
                    console.log(`   Sample MongoDB product: ${sampleProduct.name}`);
                }
            } else {
                console.log('   ❌ MongoDB is not connected');
            }
        } catch (error) {
            console.log(`   ❌ Error checking MongoDB: ${error.message}`);
        }

        // 3. Test the readDb function
        console.log('\n3. Testing readDb function...');
        try {
            const readDb = async () => {
                try {
                    const data = await fs.readFile(path.join(__dirname, '../db.json'), 'utf8');
                    return JSON.parse(data);
                } catch (error) {
                    console.error('Error reading db.json:', error);
                    return { products: [] };
                }
            };

            const db = await readDb();
            console.log(`   ✅ readDb function works: ${db.products?.length || 0} products`);
        } catch (error) {
            console.log(`   ❌ Error in readDb function: ${error.message}`);
        }

        // 4. Test the convertJsonToMongoFormat function
        console.log('\n4. Testing convertJsonToMongoFormat function...');
        try {
            const convertJsonToMongoFormat = (jsonProduct) => {
                return {
                    _id: jsonProduct.id || jsonProduct._id,
                    name: jsonProduct.name,
                    price: parseFloat(jsonProduct.price) || jsonProduct.price,
                    discount: jsonProduct.discount || 0,
                    description: jsonProduct.description,
                    image: jsonProduct.image,
                    category: jsonProduct.category,
                    salesCount: jsonProduct.salesCount || 0,
                    totalRating: jsonProduct.totalRating || 0,
                    ratingCount: jsonProduct.ratingCount || 0,
                    averageRating: jsonProduct.averageRating || 0,
                    ratings: jsonProduct.ratings || [],
                    isActive: jsonProduct.isActive !== undefined ? jsonProduct.isActive : true,
                    createdAt: jsonProduct.createdAt || new Date(),
                    updatedAt: jsonProduct.updatedAt || new Date()
                };
            };

            const db = await readDb();
            if (db.products && db.products.length > 0) {
                const converted = convertJsonToMongoFormat(db.products[0]);
                console.log(`   ✅ convertJsonToMongoFormat works:`, {
                    _id: converted._id,
                    name: converted.name,
                    price: converted.price,
                    discount: converted.discount,
                    isActive: converted.isActive
                });
            }
        } catch (error) {
            console.log(`   ❌ Error in convertJsonToMongoFormat: ${error.message}`);
        }

        console.log('\n🎯 Debug Summary:');
        console.log('   - Check if db.json has products');
        console.log('   - Check MongoDB connection status');
        console.log('   - Verify helper functions work');
        console.log('   - Test the actual API endpoint');

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

// Run debug if this file is executed directly
if (require.main === module) {
    debugProducts();
}

module.exports = debugProducts; 