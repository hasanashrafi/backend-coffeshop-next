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
 *           type: integer
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           description: The name of the product
 *         price:
 *           type: number
 *           description: The price of the product
 *         discount:
 *           type: number
 *           description: The discount percentage
 *         description:
 *           type: string
 *           description: The product description
 *         image:
 *           type: string
 *           description: The product image path
 *         category:
 *           type: string
 *           description: The product category
 */

// Helper function to read and write to db.json
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
    const db = await readDb();
    res.json(db.products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const db = await readDb();
    const product = db.products.find(p => p.id === parseInt(req.params.id));
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const db = await readDb();
    const newProduct = {
      id: db.products.length > 0 ? Math.max(...db.products.map(p => p.id)) + 1 : 1,
      ...req.body
    };
    db.products.push(newProduct);
    await writeDb(db);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const db = await readDb();
    const index = db.products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    db.products[index] = { ...db.products[index], ...req.body, id: parseInt(req.params.id) };
    await writeDb(db);
    res.json(db.products[index]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.patchProduct = async (req, res) => {
  try {
    const db = await readDb();
    const index = db.products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    db.products[index] = { ...db.products[index], ...req.body };
    await writeDb(db);
    res.json(db.products[index]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const db = await readDb();
    const index = db.products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const deleted = db.products.splice(index, 1);
    await writeDb(db);
    res.json({ message: 'Product deleted', product: deleted[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 