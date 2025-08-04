const Product = require('../models/Product');
const fs = require('fs').promises;
const path = require('path');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           description: The name of the product
 *         price:
 *           type: number
 *           description: The price of the product
 *         discount:
 *           type: number
 *           description: The discount percentage (0-100)
 *         discountedPrice:
 *           type: number
 *           description: The price after discount
 *         description:
 *           type: string
 *           description: The product description
 *         image:
 *           type: string
 *           description: The product image path
 *         category:
 *           type: string
 *           description: The product category
 *         salesCount:
 *           type: number
 *           description: Number of times this product has been sold
 *         averageRating:
 *           type: number
 *           description: Average rating of the product
 *         ratingCount:
 *           type: number
 *           description: Number of ratings received
 *         ratings:
 *           type: array
 *           description: Array of user ratings
 *         isActive:
 *           type: boolean
 *           description: Whether the product is active
 */

// Helper function to read and write to db.json (for backward compatibility)
const readDb = async () => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../db.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading db.json:', error);
    return { products: [] };
  }
};

const writeDb = async (data) => {
  try {
    await fs.writeFile(path.join(__dirname, '../db.json'), JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing db.json:', error);
  }
};

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
};

// Helper function to convert JSON product to MongoDB format
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

// Controller functions
exports.getAllProducts = async (req, res) => {
  try {
    const { category, hasDiscount, minRating, sortBy, sortOrder = 'asc' } = req.query;

    // Try MongoDB first
    if (isMongoConnected()) {
      let query = { isActive: true };

      // Filter by category
      if (category) {
        query.category = category;
      }

      // Filter by discount
      if (hasDiscount === 'true') {
        query.discount = { $gt: 0 };
      } else if (hasDiscount === 'false') {
        query.discount = 0;
      }

      // Filter by minimum rating
      if (minRating) {
        query.averageRating = { $gte: parseFloat(minRating) };
      }

      // Build sort object
      let sort = {};
      if (sortBy) {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      } else {
        sort.createdAt = -1; // Default sort by newest
      }

      const products = await Product.find(query).sort(sort);

      // If MongoDB has products, return them
      if (products && products.length > 0) {
        // Add virtual fields to response
        const productsWithVirtuals = products.map(product => {
          const productObj = product.toObject();
          productObj.discountedPrice = product.discountedPrice;
          productObj.hasDiscount = product.hasDiscount;
          return productObj;
        });

        return res.json({
          success: true,
          data: productsWithVirtuals,
          count: productsWithVirtuals.length
        });
      }
      
      // If MongoDB is connected but empty, fall back to JSON
      console.log('MongoDB connected but empty, using JSON file fallback');
    } else {
      console.log('MongoDB not connected, using JSON file fallback');
    }

    // Fallback to JSON file
    const db = await readDb();
    let products = db.products || [];

    // Apply filters
    if (category) {
      products = products.filter(p => p.category === category);
    }

    if (hasDiscount === 'true') {
      products = products.filter(p => p.discount && p.discount > 0);
    } else if (hasDiscount === 'false') {
      products = products.filter(p => !p.discount || p.discount === 0);
    }

    if (minRating) {
      products = products.filter(p => p.averageRating >= parseFloat(minRating));
    }

    // Apply sorting
    if (sortBy) {
      products.sort((a, b) => {
        const aVal = a[sortBy] || 0;
        const bVal = b[sortBy] || 0;
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      });
    } else {
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Add virtual fields
    const productsWithVirtuals = products.map(product => {
      const productData = convertJsonToMongoFormat(product);
      return {
        ...productData,
        discountedPrice: productData.discount > 0 ?
          productData.price - (productData.price * productData.discount / 100) :
          productData.price,
        hasDiscount: productData.discount > 0
      };
    });

    res.json({
      success: true,
      data: productsWithVirtuals,
      count: productsWithVirtuals.length
    });
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Try MongoDB first
    if (isMongoConnected()) {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const productObj = product.toObject();
      productObj.discountedPrice = product.discountedPrice;
      productObj.hasDiscount = product.hasDiscount;

      return res.json({
        success: true,
        data: productObj
      });
    }

    // Fallback to JSON file
    const db = await readDb();
    const product = db.products.find(p => p.id === parseInt(id) || p._id === id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const productData = convertJsonToMongoFormat(product);
    productData.discountedPrice = productData.discount > 0 ?
      productData.price - (productData.price * productData.discount / 100) :
      productData.price;
    productData.hasDiscount = productData.discount > 0;

    res.json({
      success: true,
      data: productData
    });
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    // Try MongoDB first
    if (isMongoConnected()) {
      const product = new Product(req.body);
      await product.save();

      const productObj = product.toObject();
      productObj.discountedPrice = product.discountedPrice;
      productObj.hasDiscount = product.hasDiscount;

      return res.status(201).json({
        success: true,
        data: productObj
      });
    }

    // Fallback to JSON file
    const db = await readDb();
    const newProduct = {
      id: db.products.length > 0 ? Math.max(...db.products.map(p => p.id)) + 1 : 1,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.products.push(newProduct);
    await writeDb(db);

    const productData = convertJsonToMongoFormat(newProduct);
    productData.discountedPrice = productData.discount > 0 ?
      productData.price - (productData.price * productData.discount / 100) :
      productData.price;
    productData.hasDiscount = productData.discount > 0;

    res.status(201).json({
      success: true,
      data: productData
    });
  } catch (error) {
    console.error('Error in createProduct:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Try MongoDB first
    if (isMongoConnected()) {
      const product = await Product.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const productObj = product.toObject();
      productObj.discountedPrice = product.discountedPrice;
      productObj.hasDiscount = product.hasDiscount;

      return res.json({
        success: true,
        data: productObj
      });
    }

    // Fallback to JSON file
    const db = await readDb();
    const index = db.products.findIndex(p => p.id === parseInt(id) || p._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    db.products[index] = {
      ...db.products[index],
      ...req.body,
      id: parseInt(id),
      updatedAt: new Date().toISOString()
    };
    await writeDb(db);

    const productData = convertJsonToMongoFormat(db.products[index]);
    productData.discountedPrice = productData.discount > 0 ?
      productData.price - (productData.price * productData.discount / 100) :
      productData.price;
    productData.hasDiscount = productData.discount > 0;

    res.json({
      success: true,
      data: productData
    });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.patchProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Try MongoDB first
    if (isMongoConnected()) {
      const product = await Product.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const productObj = product.toObject();
      productObj.discountedPrice = product.discountedPrice;
      productObj.hasDiscount = product.hasDiscount;

      return res.json({
        success: true,
        data: productObj
      });
    }

    // Fallback to JSON file
    const db = await readDb();
    const index = db.products.findIndex(p => p.id === parseInt(id) || p._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    db.products[index] = {
      ...db.products[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    await writeDb(db);

    const productData = convertJsonToMongoFormat(db.products[index]);
    productData.discountedPrice = productData.discount > 0 ?
      productData.price - (productData.price * productData.discount / 100) :
      productData.price;
    productData.hasDiscount = productData.discount > 0;

    res.json({
      success: true,
      data: productData
    });
  } catch (error) {
    console.error('Error in patchProduct:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Try MongoDB first
    if (isMongoConnected()) {
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      return res.json({
        success: true,
        message: 'Product deleted successfully',
        data: product
      });
    }

    // Fallback to JSON file
    const db = await readDb();
    const index = db.products.findIndex(p => p.id === parseInt(id) || p._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const deleted = db.products.splice(index, 1);
    await writeDb(db);

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: deleted[0]
    });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @swagger
 * /api/products/{id}/rate:
 *   post:
 *     summary: Rate a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5 stars
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional comment with rating
 *               userId:
 *                 type: string
 *                 description: User ID (if not provided in auth)
 *     responses:
 *       200:
 *         description: Rating added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid rating or missing user ID
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
exports.rateProduct = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { id } = req.params;
    const userId = req.user?.id || req.body.userId; // Get from auth middleware or body

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.addRating(userId, rating, comment);

    const productObj = product.toObject();
    productObj.discountedPrice = product.discountedPrice;
    productObj.hasDiscount = product.hasDiscount;

    res.json({
      success: true,
      message: 'Rating added successfully',
      data: productObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @swagger
 * /api/products/{id}/ratings:
 *   get:
 *     summary: Get product ratings
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product ratings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     averageRating:
 *                       type: number
 *                     ratingCount:
 *                       type: number
 *                     ratings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           userId:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           rating:
 *                             type: number
 *                           comment:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
exports.getProductRatings = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('ratings.userId', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: {
        averageRating: product.averageRating,
        ratingCount: product.ratingCount,
        ratings: product.ratings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @swagger
 * /api/products/{id}/increment-sales:
 *   post:
 *     summary: Increment product sales count
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 default: 1
 *                 description: Quantity to increment sales count
 *     responses:
 *       200:
 *         description: Sales count updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
exports.incrementSales = async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.incrementSales(quantity);

    const productObj = product.toObject();
    productObj.discountedPrice = product.discountedPrice;
    productObj.hasDiscount = product.hasDiscount;

    res.json({
      success: true,
      message: 'Sales count updated successfully',
      data: productObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @swagger
 * /api/products/discounted/all:
 *   get:
 *     summary: Get all discounted products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Discounted products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 count:
 *                   type: number
 *       500:
 *         description: Server error
 */
exports.getDiscountedProducts = async (req, res) => {
  try {
    // Try MongoDB first
    if (isMongoConnected()) {
      const products = await Product.find({ 
        discount: { $gt: 0 },
        isActive: true 
      }).sort({ discount: -1 });
      
      const productsWithVirtuals = products.map(product => {
        const productObj = product.toObject();
        productObj.discountedPrice = product.discountedPrice;
        productObj.hasDiscount = product.hasDiscount;
        return productObj;
      });
      
      return res.json({
        success: true,
        data: productsWithVirtuals,
        count: productsWithVirtuals.length
      });
    }
    
    // Fallback to JSON file
    const db = await readDb();
    const products = (db.products || []).filter(p => p.discount && p.discount > 0);
    products.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    
    const productsWithVirtuals = products.map(product => {
      const productData = convertJsonToMongoFormat(product);
      return {
        ...productData,
        discountedPrice: productData.discount > 0 ? 
          productData.price - (productData.price * productData.discount / 100) : 
          productData.price,
        hasDiscount: productData.discount > 0
      };
    });
    
    res.json({
      success: true,
      data: productsWithVirtuals,
      count: productsWithVirtuals.length
    });
  } catch (error) {
    console.error('Error in getDiscountedProducts:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @swagger
 * /api/products/top-rated/all:
 *   get:
 *     summary: Get top rated products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products to retrieve
 *     responses:
 *       200:
 *         description: Top rated products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 count:
 *                   type: number
 *       500:
 *         description: Server error
 */
exports.getTopRatedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Try MongoDB first
    if (isMongoConnected()) {
      const products = await Product.find({ 
        averageRating: { $gt: 0 },
        isActive: true 
      })
      .sort({ averageRating: -1, ratingCount: -1 })
      .limit(parseInt(limit));
      
      const productsWithVirtuals = products.map(product => {
        const productObj = product.toObject();
        productObj.discountedPrice = product.discountedPrice;
        productObj.hasDiscount = product.hasDiscount;
        return productObj;
      });
      
      return res.json({
        success: true,
        data: productsWithVirtuals,
        count: productsWithVirtuals.length
      });
    }
    
    // Fallback to JSON file
    const db = await readDb();
    let products = (db.products || []).filter(p => p.averageRating && p.averageRating > 0);
    products.sort((a, b) => {
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      return (b.ratingCount || 0) - (a.ratingCount || 0);
    });
    products = products.slice(0, parseInt(limit));
    
    const productsWithVirtuals = products.map(product => {
      const productData = convertJsonToMongoFormat(product);
      return {
        ...productData,
        discountedPrice: productData.discount > 0 ? 
          productData.price - (productData.price * productData.discount / 100) : 
          productData.price,
        hasDiscount: productData.discount > 0
      };
    });
    
    res.json({
      success: true,
      data: productsWithVirtuals,
      count: productsWithVirtuals.length
    });
  } catch (error) {
    console.error('Error in getTopRatedProducts:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @swagger
 * /api/products/best-selling/all:
 *   get:
 *     summary: Get best selling products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products to retrieve
 *     responses:
 *       200:
 *         description: Best selling products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 count:
 *                   type: number
 *       500:
 *         description: Server error
 */
exports.getBestSellingProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Try MongoDB first
    if (isMongoConnected()) {
      const products = await Product.find({ 
        salesCount: { $gt: 0 },
        isActive: true 
      })
      .sort({ salesCount: -1 })
      .limit(parseInt(limit));
      
      const productsWithVirtuals = products.map(product => {
        const productObj = product.toObject();
        productObj.discountedPrice = product.discountedPrice;
        productObj.hasDiscount = product.hasDiscount;
        return productObj;
      });
      
      return res.json({
        success: true,
        data: productsWithVirtuals,
        count: productsWithVirtuals.length
      });
    }
    
    // Fallback to JSON file
    const db = await readDb();
    let products = (db.products || []).filter(p => p.salesCount && p.salesCount > 0);
    products.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
    products = products.slice(0, parseInt(limit));
    
    const productsWithVirtuals = products.map(product => {
      const productData = convertJsonToMongoFormat(product);
      return {
        ...productData,
        discountedPrice: productData.discount > 0 ? 
          productData.price - (productData.price * productData.discount / 100) : 
          productData.price,
        hasDiscount: productData.discount > 0
      };
    });
    
    res.json({
      success: true,
      data: productsWithVirtuals,
      count: productsWithVirtuals.length
    });
  } catch (error) {
    console.error('Error in getBestSellingProducts:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 