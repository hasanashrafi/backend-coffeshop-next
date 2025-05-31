# Coffee Shop Backend API

A RESTful API for managing coffee shop products, built with Express.js and documented with Swagger.

## Features

- CRUD operations for products
- Swagger API documentation
- JSON file-based database
- CORS enabled
- Error handling
- Request logging

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable.

## API Documentation

Once the server is running, you can access the Swagger documentation at:
```
http://localhost:3000/api-docs
```

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product (full update)
- `PATCH /api/products/:id` - Update a product (partial update)
- `DELETE /api/products/:id` - Delete a product

## Example Product Object

```json
{
  "id": 1,
  "name": "قهوه اسپرسو بن مانو مدل پریسکا 250 گرمی",
  "price": 125,
  "discount": 14.5,
  "description": "This is product 1.",
  "image": "/images/products/p1.png",
  "category": "coffee"
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 200: Success
- 201: Created
- 404: Not Found
- 500: Server Error

## License

MIT 