const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const usersRouter = require('./users');
const productRoutes = require('./products');

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Coffee Shop API',
      version: '1.0.0',
      description: 'API documentation for the Coffee Shop application',
    },
    servers: [
      {
        url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:10000',
        description: 'API server',
      },
    ],
  },
  apis: ['./api/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/users', usersRouter);
app.use('/api/products', productRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 