const fs = require('fs').promises;
const path = require('path');

async function migrateProducts() {
    try {
        console.log('Starting product migration...');

        // Read the current db.json
        const dbPath = path.join(__dirname, '../db.json');
        const data = await fs.readFile(dbPath, 'utf8');
        const db = JSON.parse(data);

        // Update each product with new fields
        const updatedProducts = db.products.map(product => ({
            ...product,
            salesCount: product.salesCount || 0,
            totalRating: product.totalRating || 0,
            ratingCount: product.ratingCount || 0,
            averageRating: product.averageRating || 0,
            ratings: product.ratings || [],
            isActive: product.isActive !== undefined ? product.isActive : true,
            updatedAt: new Date().toISOString()
        }));

        // Update the database
        db.products = updatedProducts;
        await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

        console.log(`Successfully migrated ${updatedProducts.length} products`);
        console.log('Migration completed!');

    } catch (error) {
        console.error('Migration failed:', error);
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    migrateProducts();
}

module.exports = migrateProducts; 