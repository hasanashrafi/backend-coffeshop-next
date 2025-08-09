const fs = require('fs').promises;
const path = require('path');

const dbPath = path.join(__dirname, '../db.json');

// Helper function to read database
const readDB = async () => {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    throw new Error('Database read error');
  }
};

// Helper function to write to database
const writeDB = async (data) => {
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to database:', error);
    throw new Error('Database write error');
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const db = await readDB();
    const activeCategories = db.categories.filter(category => category.isActive);
    
    // Sort by sortOrder
    activeCategories.sort((a, b) => a.sortOrder - b.sortOrder);
    
    res.status(200).json({
      success: true,
      data: activeCategories,
      total: activeCategories.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDB();
    
    const category = db.categories.find(cat => cat.id === parseInt(id));
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (!category.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Category not available'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

// Get category by slug
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const db = await readDB();
    
    const category = db.categories.find(cat => cat.slug === slug && cat.isActive);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 10, sort = 'name', order = 'asc' } = req.query;
    
    const db = await readDB();
    
    // Find category by slug
    const category = db.categories.find(cat => cat.slug === slug && cat.isActive);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Filter products by category
    let categoryProducts = db.products.filter(product => 
      product.category === slug && product.isActive
    );

    // Sort products
    categoryProducts.sort((a, b) => {
      let aValue = a[sort];
      let bValue = b[sort];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (order === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = categoryProducts.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: {
        category: category,
        products: paginatedProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(categoryProducts.length / limit),
          totalProducts: categoryProducts.length,
          hasNext: endIndex < categoryProducts.length,
          hasPrev: startIndex > 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching category products',
      error: error.message
    });
  }
};

// Create new category
const createCategory = async (req, res) => {
  try {
    const { name, slug, description, image, sortOrder } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Name and slug are required'
      });
    }

    const db = await readDB();
    
    // Check if slug already exists
    const existingCategory = db.categories.find(cat => cat.slug === slug);
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this slug already exists'
      });
    }

    // Generate new ID
    const newId = Math.max(...db.categories.map(cat => cat.id)) + 1;
    
    const newCategory = {
      id: newId,
      name,
      slug,
      description: description || '',
      image: image || '',
      isActive: true,
      sortOrder: sortOrder || 999
    };

    db.categories.push(newCategory);
    await writeDB(db);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const db = await readDB();
    const categoryIndex = db.categories.findIndex(cat => cat.id === parseInt(id));
    
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if slug is being updated and already exists
    if (updateData.slug) {
      const existingCategory = db.categories.find(cat => 
        cat.slug === updateData.slug && cat.id !== parseInt(id)
      );
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this slug already exists'
        });
      }
    }

    // Update category
    db.categories[categoryIndex] = { ...db.categories[categoryIndex], ...updateData };
    await writeDB(db);

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: db.categories[categoryIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

// Patch category (partial update)
const patchCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const db = await readDB();
    const categoryIndex = db.categories.findIndex(cat => cat.id === parseInt(id));
    
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Update only provided fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        db.categories[categoryIndex][key] = updateData[key];
      }
    });

    await writeDB(db);

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: db.categories[categoryIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

// Delete category (soft delete)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const db = await readDB();
    const categoryIndex = db.categories.findIndex(cat => cat.id === parseInt(id));
    
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Soft delete
    db.categories[categoryIndex].isActive = false;
    await writeDB(db);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  getProductsByCategory,
  createCategory,
  updateCategory,
  patchCategory,
  deleteCategory
}; 