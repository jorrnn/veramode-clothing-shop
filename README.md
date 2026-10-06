# ÉLAN Clothing — HTML, CSS, JavaScript + Express

A modern clothing shopping website inspired by the uploaded fashion-app reference:
- Clean black/white luxury aesthetic
- Large editorial hero section
- Women / Men / Kids filters
- Product cards
- Favorites button
- Search modal
- Shopping cart using localStorage
- Simple Express backend
- Basic checkout/order API
- Newsletter API

## Project structure

```text
clothing-brand-shop/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── backend/
│   ├── server.js
│   └── data/
│       └── products.json
├── package.json
└── README.md
```

## How to run

1. Install Node.js (LTS).
2. Open a terminal in this project folder.
3. Install Express:

```bash
npm install
```

4. Start the server:

```bash
npm start
```

5. Open:

```text
http://localhost:3000
```

## Backend explained

The backend is deliberately simple so it is easy to understand.

### GET /api/products
Returns all clothing products.

Example:

```text
GET http://localhost:3000/api/products
```

You can also filter:

```text
GET /api/products?category=Women
GET /api/products?search=coat
```

### GET /api/products/:id
Returns one product.

```text
GET /api/products/1
```

### POST /api/orders
Creates an order.

The frontend sends:

```json
{
  "customer": "John",
  "email": "john@example.com",
  "items": [
    { "id": 1, "quantity": 2 }
  ]
}
```

The server validates the products, calculates the total and returns an order ID.

### GET /api/orders/:orderId
Returns a previously created order.

### POST /api/newsletter
Stores a newsletter email in memory.

## Important for a real business

This demo keeps orders/subscribers in memory, so they disappear when the server restarts. For a production website, replace the arrays with a database such as MySQL, PostgreSQL or MongoDB and connect a real payment provider such as Stripe or Paystack.

Product images currently use public image URLs. For your own brand, replace the `image` values in `backend/data/products.json` with your own product photos.

## Design notes

The layout follows the uploaded reference's visual direction: rounded fashion imagery, minimal navigation, pill filters, large typography, product cards and a slide-out shopping bag.
