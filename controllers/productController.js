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
  const data = await fs.readFile(path.join(__dirname, '../db.json'), 'utf8');
  return JSON.parse(data);
};

const writeDb = async (data) => {
  await fs.writeFile(path.join(__dirname, '../db.json'), JSON.stringify(data, null, 2));
};

// Controller functions
exports.getAllProducts = async (req, res) => {
  try {
    const { category, hasDiscount, minRating, sortBy, sortOrder = 'asc' } = req.query;
    
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
    
    // Add virtual fields to response
    const productsWithVirtuals = products.map(product => {
      const productObj = product.toObject();
      productObj.discountedPrice = product.discountedPrice;
      productObj.hasDiscount = product.hasDiscount;
      return productObj;
    });
    
    res.json({
      success: true,
      data: productsWithVirtuals,
      count: productsWithVirtuals.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    const productObj = product.toObject();
    productObj.discountedPrice = product.discountedPrice;
    productObj.hasDiscount = product.hasDiscount;
    
    res.json({
      success: true,
      data: productObj
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    
    const productObj = product.toObject();
    productObj.discountedPrice = product.discountedPrice;
    productObj.hasDiscount = product.hasDiscount;
    
    res.status(201).json({
      success: true,
      data: productObj
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
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
    
    res.json({
      success: true,
      data: productObj
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.patchProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
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
    
    res.json({
      success: true,
      data: productObj
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Product deleted successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// New rating functionality
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

// Get products with discounts
exports.getDiscountedProducts = async (req, res) => {
  try {
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
    
    res.json({
      success: true,
      data: productsWithVirtuals,
      count: productsWithVirtuals.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get top rated products
exports.getTopRatedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
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
    
    res.json({
      success: true,
      data: productsWithVirtuals,
      count: productsWithVirtuals.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get best selling products
exports.getBestSellingProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
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
    
    res.json({
      success: true,
      data: productsWithVirtuals,
      count: productsWithVirtuals.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 