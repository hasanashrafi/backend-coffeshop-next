# User Dashboard API Documentation

## Overview

This document describes the API endpoints for user dashboard functionality including order management, user statistics, favorite products, and profile management.

## User Dashboard Features

### 1. Order Management

- Create and track orders
- Order status tracking (pending, processing, completed, delivered, cancelled)
- Order history and statistics
- Recent orders display

### 2. User Statistics

- Loyalty points tracking
- Total spending and orders
- Favorite products count
- Order status summaries

### 3. Favorite Products

- Add/remove products from favorites
- View favorite products list
- Check favorite status

### 4. User Profile

- Profile information management
- User statistics display
- Profile updates

## API Endpoints

### User Dashboard

#### Get User Dashboard Data

```
GET /api/dashboard/:userId/dashboard
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "reza",
      "email": "ahmadashrafi@gmail.com",
      "firstName": "Reza",
      "lastName": "Ahmad",
      "fullName": "Reza Ahmad",
      "displayName": "Reza Ahmad",
      "avatar": "/images/avatar.jpg",
      "phone": "+989123456789",
      "loyaltyPoints": 450,
      "totalSpent": 1250000,
      "totalOrders": 24,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "address": {
        "street": "Main Street",
        "city": "Tehran",
        "postalCode": "12345",
        "country": "Iran"
      }
    },
    "statistics": {
      "loyaltyPoints": 450,
      "favoriteProductsCount": 8,
      "totalSpent": 1250000,
      "totalOrders": 24,
      "averageOrderValue": 52083
    },
    "recentOrders": [
      {
        "orderNumber": "20250101001",
        "status": "delivered",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "items": [
          {
            "productName": "آمریکانو",
            "quantity": 2
          }
        ]
      }
    ],
    "orderStatusSummary": {
      "pending": { "count": 2, "totalAmount": 100000 },
      "processing": { "count": 1, "totalAmount": 55000 },
      "completed": { "count": 5, "totalAmount": 250000 },
      "delivered": { "count": 15, "totalAmount": 750000 },
      "cancelled": { "count": 1, "totalAmount": 50000 }
    },
    "favoriteProducts": [
      {
        "_id": "product_id",
        "name": "قهوه اسپرسو",
        "image": "/images/products/p1.png",
        "price": 125000,
        "discount": 14.5,
        "discountedPrice": 106875,
        "hasDiscount": true,
        "averageRating": 4.5
      }
    ]
  }
}
```

#### Get User Profile

```
GET /api/dashboard/:userId/profile
```

#### Update User Profile

```
PUT /api/dashboard/:userId/profile
```

**Request Body:**

```json
{
  "firstName": "Reza",
  "lastName": "Ahmad",
  "phone": "+989123456789",
  "address": {
    "street": "Main Street",
    "city": "Tehran",
    "postalCode": "12345",
    "country": "Iran"
  }
}
```

#### Get User Statistics

```
GET /api/dashboard/:userId/statistics
```

**Response:**

```json
{
  "success": true,
  "data": {
    "loyaltyPoints": 450,
    "favoriteProductsCount": 8,
    "totalOrders": 24,
    "totalSpent": 1250000,
    "averageOrderValue": 52083
  }
}
```

### Favorite Products

#### Get User Favorite Products

```
GET /api/dashboard/:userId/favorites?limit=10&page=1
```

#### Add Product to Favorites

```
POST /api/dashboard/:userId/favorites/:productId
```

#### Remove Product from Favorites

```
DELETE /api/dashboard/:userId/favorites/:productId
```

#### Check Favorite Status

```
GET /api/dashboard/:userId/favorites/:productId/check
```

**Response:**

```json
{
  "success": true,
  "data": {
    "isFavorite": true
  }
}
```

### Order Management

#### Create New Order

```
POST /api/orders
```

**Request Body:**

```json
{
  "userId": "user_id",
  "items": [
    {
      "productId": "product_id",
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "street": "Main Street",
    "city": "Tehran",
    "postalCode": "12345",
    "phone": "+989123456789"
  },
  "paymentMethod": "cash",
  "notes": "Please deliver in the morning"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "order_id",
    "orderNumber": "20250101001",
    "userId": "user_id",
    "items": [
      {
        "productId": "product_id",
        "productName": "قهوه اسپرسو",
        "quantity": 2,
        "price": 125000,
        "discount": 14.5,
        "totalPrice": 213750
      }
    ],
    "totalAmount": 213750,
    "status": "pending",
    "paymentStatus": "pending",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Get User Orders

```
GET /api/orders/user/:userId?status=delivered&limit=10&page=1
```

**Query Parameters:**

- `status` - Filter by order status
- `limit` - Number of orders per page
- `page` - Page number

#### Get Order by ID

```
GET /api/orders/:orderId
```

#### Update Order Status

```
PUT /api/orders/:orderId/status
```

**Request Body:**

```json
{
  "status": "processing",
  "note": "Order is being prepared"
}
```

#### Cancel Order

```
DELETE /api/orders/:orderId
```

**Request Body:**

```json
{
  "reason": "Changed my mind"
}
```

### Order Statistics

#### Get Order Status Summary

```
GET /api/orders/user/:userId/summary
```

**Response:**

```json
{
  "success": true,
  "data": {
    "pending": { "count": 2, "totalAmount": 100000 },
    "processing": { "count": 1, "totalAmount": 55000 },
    "completed": { "count": 5, "totalAmount": 250000 },
    "delivered": { "count": 15, "totalAmount": 750000 },
    "cancelled": { "count": 1, "totalAmount": 50000 }
  }
}
```

#### Get Recent Orders

```
GET /api/orders/user/:userId/recent?limit=5
```

#### Get Order Statistics

```
GET /api/orders/user/:userId/statistics
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalOrders": 24,
    "totalSpent": 1250000,
    "averageOrderValue": 52083,
    "loyaltyPoints": 450
  }
}
```

## Data Models

### Order Model

```javascript
{
  userId: ObjectId (ref: 'User'),
  orderNumber: String (auto-generated),
  items: [{
    productId: ObjectId (ref: 'Product'),
    productName: String,
    quantity: Number,
    price: Number,
    discount: Number,
    totalPrice: Number
  }],
  totalAmount: Number,
  status: String (pending, processing, completed, delivered, cancelled),
  statusHistory: [{
    status: String,
    timestamp: Date,
    note: String
  }],
  deliveryAddress: {
    street: String,
    city: String,
    postalCode: String,
    phone: String
  },
  paymentMethod: String,
  paymentStatus: String (pending, paid, failed),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Enhanced User Model

```javascript
{
  username: String,
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  phone: String,
  avatar: String,
  loyaltyPoints: Number,
  totalSpent: Number,
  totalOrders: Number,
  favoriteProducts: [ObjectId (ref: 'Product')],
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  preferences: {
    notifications: Boolean,
    newsletter: Boolean,
    language: String
  },
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Order Status Flow

1. **pending** - Order created, waiting for confirmation
2. **processing** - Order confirmed, being prepared
3. **completed** - Order ready for delivery
4. **delivered** - Order delivered to customer
5. **cancelled** - Order cancelled (cannot be changed back)

## Loyalty Points System

- 1 point per 1000 toman spent
- Points are automatically added when orders are created
- Points can be used for discounts or rewards

## Frontend Integration Examples

### React/Next.js Example

```javascript
// Get user dashboard data
const getUserDashboard = async (userId) => {
  const response = await fetch(`/api/dashboard/${userId}/dashboard`);
  const { data } = await response.json();
  return data;
};

// Create new order
const createOrder = async (orderData) => {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData)
  });
  return response.json();
};

// Add to favorites
const addToFavorites = async (userId, productId) => {
  const response = await fetch(
    `/api/dashboard/${userId}/favorites/${productId}`,
    {
      method: "POST"
    }
  );
  return response.json();
};

// Get recent orders
const getRecentOrders = async (userId) => {
  const response = await fetch(`/api/orders/user/${userId}/recent?limit=3`);
  const { data } = await response.json();
  return data;
};
```

### Vue.js Example

```javascript
// Get user statistics
const getUserStatistics = async (userId) => {
  const response = await fetch(`/api/dashboard/${userId}/statistics`);
  const { data } = await response.json();
  return data;
};

// Update order status
const updateOrderStatus = async (orderId, status, note) => {
  const response = await fetch(`/api/orders/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, note })
  });
  return response.json();
};
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

## Security Considerations

1. **Authentication**: Implement proper user authentication
2. **Authorization**: Ensure users can only access their own data
3. **Input Validation**: Validate all inputs on server side
4. **Rate Limiting**: Consider rate limiting for order creation
5. **Data Sanitization**: Sanitize user inputs to prevent XSS

## Performance Optimizations

1. **Database Indexing**: Index frequently queried fields
2. **Pagination**: Large lists are paginated
3. **Population**: Use MongoDB population for related data
4. **Caching**: Consider caching for frequently accessed data
