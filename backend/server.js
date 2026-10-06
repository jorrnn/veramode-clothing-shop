const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/products.json"), "utf8")
);

const orders = [];
const subscribers = [];

// GET all products, with optional category/search filters
app.get("/api/products", (req, res) => {
  const { category, search } = req.query;
  let result = products;

  if (category && category !== "All") {
    result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  res.json(result);
});

// GET one product
app.get("/api/products/:id", (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// POST a new order
app.post("/api/orders", (req, res) => {
  const { customer, email, items } = req.body;

  if (!customer || !email || !Array.isArray(items) || !items.length) {
    return res.status(400).json({
      message: "Customer, email and at least one item are required."
    });
  }

  let total = 0;
  const orderItems = [];

  for (const item of items) {
    const product = products.find(p => p.id === Number(item.id));
    const quantity = Number(item.quantity);

    if (!product || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Invalid product or quantity." });
    }

    total += product.price * quantity;
    orderItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity
    });
  }

  const order = {
    orderId: `ELAN-${Date.now()}`,
    customer,
    email,
    items: orderItems,
    total: Number(total.toFixed(2)),
    status: "Received",
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  res.status(201).json(order);
});

// GET an order by ID
app.get("/api/orders/:orderId", (req, res) => {
  const order = orders.find(o => o.orderId === req.params.orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

// Newsletter signup
app.post("/api/newsletter", (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "Enter a valid email." });
  }

  if (!subscribers.includes(email)) subscribers.push(email);
  res.status(201).json({ message: "Subscribed successfully." });
});

// Simple health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "ÉLAN Clothing API" });
});

// Send all unknown routes back to the website
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, () => {
  console.log(`ÉLAN Clothing is running at http://localhost:${PORT}`);
});
