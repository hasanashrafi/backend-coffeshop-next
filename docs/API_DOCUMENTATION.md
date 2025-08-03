# Coffee Shop API Documentation

## Product Features

### 1. Product Discount System

- Products can have discounts (0-100%)
- Automatic calculation of discounted prices
- Filter products by discount status

### 2. Product Rating System

- Users can rate products (1-5 stars)
- Support for comments with ratings
- Automatic calculation of average ratings
- Prevent duplicate ratings from same user

### 3. Sales Tracking

- Track number of times each product is sold
- Increment sales count when products are purchased
- Get best-selling products

## API Endpoints

### Product Management

#### Get All Products

```
GET /api/products
```

**Query Parameters:**

- `category` - Filter by category
- `hasDiscount` - Filter by discount status (true/false)
- `minRating` - Filter by minimum rating
- `sortBy` - Sort field (price, averageRating, salesCount, etc.)
- `sortOrder` - Sort order (asc/desc)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "price": 100000,
      "discount": 15,
      "discountedPrice": 85000,
      "hasDiscount": true,
      "description": "Product description",
      "image": "/images/product.png",
      "category": "coffee",
      "salesCount": 25,
      "averageRating": 4.5,
      "ratingCount": 10,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### Get Product by ID

```
GET /api/products/:id
```

#### Create Product

```
POST /api/products
```

**Request Body:**

```json
{
  "name": "Product Name",
  "price": 100000,
  "discount": 15,
  "description": "Product description",
  "image": "/images/product.png",
  "category": "coffee"
}
```

#### Update Product

```
PUT /api/products/:id
```

#### Patch Product

```
PATCH /api/products/:id
```

#### Delete Product

```
DELETE /api/products/:id
```

### Rating System

#### Rate a Product

```
POST /api/products/:id/rate
```

**Request Body:**

```json
{
  "rating": 5,
  "comment": "Great product!",
  "userId": "user_id"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Rating added successfully",
  "data": {
    "_id": "product_id",
    "name": "Product Name",
    "averageRating": 4.5,
    "ratingCount": 11,
    "discountedPrice": 85000,
    "hasDiscount": true
  }
}
```

#### Get Product Ratings

```
GET /api/products/:id/ratings
```

**Response:**

```json
{
  "success": true,
  "data": {
    "averageRating": 4.5,
    "ratingCount": 10,
    "ratings": [
      {
        "_id": "rating_id",
        "userId": {
          "_id": "user_id",
          "name": "User Name",
          "email": "user@example.com"
        },
        "rating": 5,
        "comment": "Great product!",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Sales Tracking

#### Increment Sales Count

```
POST /api/products/:id/increment-sales
```

**Request Body:**

```json
{
  "quantity": 2
}
```

**Response:**

```json
{
  "success": true,
  "message": "Sales count updated successfully",
  "data": {
    "_id": "product_id",
    "name": "Product Name",
    "salesCount": 27,
    "discountedPrice": 85000,
    "hasDiscount": true
  }
}
```

### Special Product Lists

#### Get Discounted Products

```
GET /api/products/discounted/all
```

#### Get Top Rated Products

```
GET /api/products/top-rated/all?limit=10
```

#### Get Best Selling Products

```
GET /api/products/best-selling/all?limit=10
```

## Product Model Schema

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

## Virtual Fields

- `discountedPrice` - Calculated price after discount
- `hasDiscount` - Boolean indicating if product has discount

## Methods

- `calculateAverageRating()` - Calculate average rating
- `addRating(userId, rating, comment)` - Add or update user rating
- `incrementSales(quantity)` - Increment sales count

## Usage Examples

### Frontend Integration

```javascript
// Get all products with discounts
const response = await fetch("/api/products?hasDiscount=true");
const { data: discountedProducts } = await response.json();

// Rate a product
const ratingResponse = await fetch("/api/products/123/rate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    rating: 5,
    comment: "Excellent coffee!",
    userId: "user_id"
  })
});

// Get top rated products
const topRatedResponse = await fetch("/api/products/top-rated/all?limit=5");
const { data: topRatedProducts } = await topRatedResponse.json();

// Increment sales when product is purchased
const salesResponse = await fetch("/api/products/123/increment-sales", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ quantity: 1 })
});
```

### Filtering and Sorting

```javascript
// Get products with minimum 4-star rating, sorted by price
const response = await fetch(
  "/api/products?minRating=4&sortBy=price&sortOrder=asc"
);

// Get coffee products with discounts
const response = await fetch("/api/products?category=coffee&hasDiscount=true");
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error
