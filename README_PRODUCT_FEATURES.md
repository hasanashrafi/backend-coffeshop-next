# Product Features Implementation

This document describes the implementation of advanced product features including discounts, ratings, and sales tracking.

## 🎯 Features Implemented

### 1. Product Discount System

- **Flexible Discount Range**: Products can have discounts from 0% to 100%
- **Automatic Price Calculation**: Discounted prices are calculated automatically
- **Virtual Fields**: `discountedPrice` and `hasDiscount` are computed on-the-fly
- **Filtering**: Products can be filtered by discount status

### 2. Product Rating System

- **Star Rating**: Users can rate products from 1 to 5 stars
- **Comment Support**: Optional comments with ratings (max 500 characters)
- **Duplicate Prevention**: Users can only rate once per product (updates existing rating)
- **Average Calculation**: Automatic calculation of average ratings
- **Rating History**: Complete history of all ratings with user information

### 3. Sales Tracking

- **Sales Counter**: Track number of times each product is sold
- **Increment Functionality**: Easy API to increment sales count
- **Best Sellers**: Get products sorted by sales count

## 🚀 API Endpoints

### Core Product Operations

```bash
# Get all products with filtering and sorting
GET /api/products?category=coffee&hasDiscount=true&minRating=4&sortBy=price&sortOrder=desc

# Get product by ID
GET /api/products/:id

# Create product
POST /api/products

# Update product
PUT /api/products/:id

# Delete product
DELETE /api/products/:id
```

### Rating System

```bash
# Rate a product
POST /api/products/:id/rate
{
  "rating": 5,
  "comment": "Excellent coffee!",
  "userId": "user_id"
}

# Get product ratings
GET /api/products/:id/ratings
```

### Sales Tracking

```bash
# Increment sales count
POST /api/products/:id/increment-sales
{
  "quantity": 2
}
```

### Special Product Lists

```bash
# Get discounted products
GET /api/products/discounted/all

# Get top rated products
GET /api/products/top-rated/all?limit=10

# Get best selling products
GET /api/products/best-selling/all?limit=10
```

## 📊 Database Schema

### Product Model

```javascript
{
  name: String (required),
  price: Number (required),
  discount: Number (0-100, default: 0),
  description: String,
  image: String,
  category: String (required),
  salesCount: Number (default: 0),
  totalRating: Number (default: 0),
  ratingCount: Number (default: 0),
  averageRating: Number (default: 0),
  ratings: [{
    userId: ObjectId (ref: 'User'),
    rating: Number (1-5),
    comment: String (max: 500),
    createdAt: Date
  }],
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Virtual Fields

- `discountedPrice`: Calculated price after discount
- `hasDiscount`: Boolean indicating if product has discount

## 🔧 Implementation Details

### Model Methods

```javascript
// Calculate average rating
product.calculateAverageRating();

// Add or update user rating
product.addRating(userId, rating, comment);

// Increment sales count
product.incrementSales(quantity);
```

### Response Format

All API responses follow a consistent format:

```javascript
{
  "success": true,
  "data": { /* response data */ },
  "count": 1 // for list responses
}
```

## 🧪 Testing

Run the test script to verify all features:

```bash
npm install axios  # if not already installed
node test/productFeatures.js
```

## 📱 Frontend Integration Examples

### React/Next.js Example

```javascript
// Get products with discounts
const getDiscountedProducts = async () => {
  const response = await fetch("/api/products?hasDiscount=true");
  const { data } = await response.json();
  return data;
};

// Rate a product
const rateProduct = async (productId, rating, comment, userId) => {
  const response = await fetch(`/api/products/${productId}/rate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating, comment, userId })
  });
  return response.json();
};

// Increment sales when product is purchased
const incrementSales = async (productId, quantity = 1) => {
  const response = await fetch(`/api/products/${productId}/increment-sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity })
  });
  return response.json();
};
```

### Vue.js Example

```javascript
// Get top rated products
const getTopRatedProducts = async () => {
  const response = await fetch("/api/products/top-rated/all?limit=5");
  const { data } = await response.json();
  return data;
};

// Get product ratings
const getProductRatings = async (productId) => {
  const response = await fetch(`/api/products/${productId}/ratings`);
  const { data } = await response.json();
  return data;
};
```

## 🔄 Migration

The existing database has been migrated to include new fields:

- `salesCount`: Number of sales (default: 0)
- `totalRating`: Sum of all ratings (default: 0)
- `ratingCount`: Number of ratings (default: 0)
- `averageRating`: Average rating (default: 0)
- `ratings`: Array of rating objects
- `isActive`: Product status (default: true)
- `updatedAt`: Last update timestamp

## 🎨 UI Considerations

### Displaying Discounts

```javascript
// Show original and discounted prices
{
  product.hasDiscount && (
    <div>
      <span className="line-through">{product.price}</span>
      <span className="text-red-600 font-bold">{product.discountedPrice}</span>
      <span className="text-sm text-gray-500">({product.discount}% off)</span>
    </div>
  );
}
```

### Displaying Ratings

```javascript
// Show star rating
const renderStars = (rating) => {
  return [...Array(5)].map((_, i) => <Star key={i} filled={i < rating} />);
};

// Show average rating
<div>
  {renderStars(product.averageRating)}
  <span>({product.ratingCount} reviews)</span>
</div>;
```

### Sales Counter

```javascript
// Show sales count
<div className="text-sm text-gray-600">{product.salesCount} sold</div>
```

## 🔒 Security Considerations

1. **User Authentication**: Implement proper user authentication for rating system
2. **Rate Limiting**: Consider rate limiting for rating submissions
3. **Input Validation**: All inputs are validated on both client and server
4. **Data Sanitization**: Comments are sanitized to prevent XSS

## 📈 Performance Optimizations

1. **Indexing**: Database indexes on frequently queried fields
2. **Pagination**: Large product lists are paginated
3. **Caching**: Consider caching for frequently accessed data
4. **Virtual Fields**: Computed fields don't require database storage

## 🚀 Deployment

1. Run the migration script: `node scripts/migrateProducts.js`
2. Test the features: `node test/productFeatures.js`
3. Update your frontend to use the new API endpoints
4. Monitor the application for any issues

## 📞 Support

For questions or issues with the product features:

1. Check the API documentation in `docs/API_DOCUMENTATION.md`
2. Review the test examples in `test/productFeatures.js`
3. Check the server logs for error details
