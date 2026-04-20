// ...existing code...
const express = require("express");
const app = express();
const PORT = process.env.PORT;

//require("dotenv").config(); // for local development, not needed in Docker as env vars are set in compose
const mongoose = require("mongoose");

app.use(express.json());

// seed data used only if collection is empty
const ordersSeed = [
  { id: 1, userId: 1, product: "Laptop" },
  { id: 2, userId: 2, product: "Phone" },
  { id: 3, userId: 2, product: "Tablet" },
  { id: 4, userId: 2, product: "Monitor" },
  { id: 5, userId: 3, product: "Bike" },
  { id: 6, userId: 3, product: "Car" },
  { id: 7, userId: 1, product: "Motorcycle" },
];

const orderSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true },
  product: { type: String, required: true },
});
const Order = mongoose.model("Order", orderSchema);

const mongoUri = process.env.MONGO_URI;

mongoose
  .connect(mongoUri)
  .then(async () => {
    const count = await Order.countDocuments();
    if (count === 0) {
      await Order.insertMany(ordersSeed);
      console.log("Seeded orders collection");
    }
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// GET /orders -> all orders, optional ?userId= to filter
app.get("/orders", async (req, res) => {
  const qUserId = req.query.userId;
  const filter = {};
  if (qUserId !== undefined) {
    const userId = parseInt(qUserId, 10);
    if (Number.isNaN(userId))
      return res.status(400).json({ error: "invalid userId query" });
    filter.userId = userId;
  }
  try {
    const all = await Order.find(filter).sort({ id: 1 }).lean();
    res.json(all);
  } catch (err) {
    console.error("Error getting orders:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /orders/:userId -> read orders for a specific user (kept for compatibility)
app.get("/orders/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (Number.isNaN(userId))
    return res.status(400).json({ error: "invalid userId" });
  try {
    const userOrders = await Order.find({ userId }).sort({ id: 1 }).lean();
    res.json(userOrders);
  } catch (err) {
    console.error("Error querying orders:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /orders -> create a new order
// body: { userId: number, product: string, id?: number }
app.post("/orders", async (req, res) => {
  const { id, userId, product } = req.body;

  if (userId === undefined || product === undefined) {
    return res.status(400).json({ error: "userId and product are required" });
  }
  const parsedUserId = parseInt(userId, 10);
  if (Number.isNaN(parsedUserId))
    return res.status(400).json({ error: "invalid userId" });
  if (typeof product !== "string" || product.trim() === "") {
    return res
      .status(400)
      .json({ error: "product must be a non-empty string" });
  }

  try {
    let newId = id;
    if (newId !== undefined) {
      newId = parseInt(newId, 10);
      if (Number.isNaN(newId))
        return res.status(400).json({ error: "invalid id" });
      // check duplicate
      const exists = await Order.findOne({ id: newId }).lean();
      if (exists) return res.status(409).json({ error: "id already exists" });
    } else {
      // compute next id
      const last = await Order.findOne().sort({ id: -1 }).select("id").lean();
      newId = last && last.id ? last.id + 1 : 1;
    }

    const created = await Order.create({
      id: newId,
      userId: parsedUserId,
      product: product.trim(),
    });
    res.status(201).json({
      id: created.id,
      userId: created.userId,
      product: created.product,
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: "duplicate id" });
    }
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});
// ...existing code...
