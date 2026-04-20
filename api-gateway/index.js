// ...existing code...
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const app = express();
const PORT = process.env.PORT;

//require("dotenv").config(); // for local development, not needed in Docker as env vars are set in compose

// basic middleware
app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(morgan("dev"));

// validate important env vars early to aid debugging
if (!process.env.USER_SERVICE_URL) {
  console.warn("WARNING: USER_SERVICE_URL not set — userClient may fail");
}
if (!process.env.ORDER_SERVICE_URL) {
  console.warn("WARNING: ORDER_SERVICE_URL not set — orderClient may fail");
}

// create clients with timeouts and easy baseURL changes (works in k8s/docker with service names)
const userClient = axios.create({
  baseURL: process.env.USER_SERVICE_URL,
  timeout: 5000,
});
const orderClient = axios.create({
  baseURL: process.env.ORDER_SERVICE_URL,
  timeout: 5000,
});

// helper to fetch orders for a single user (tries query param then legacy path)
// forwards authorization header (if any) so downstream services can perform auth
async function fetchOrdersForUser(userId, authHeader) {
  const headers = {};
  if (authHeader) headers.Authorization = authHeader;

  try {
    const ordersResponse = await orderClient.get("/orders", {
      params: { userId },
      headers,
    });
    return ordersResponse.data;
  } catch (errFirst) {
    try {
      const ordersResponse2 = await orderClient.get(`/orders/${userId}`, {
        headers,
      });
      return ordersResponse2.data;
    } catch (errSecond) {
      console.error(
        `Failed to fetch orders for user ${userId}:`,
        errSecond.message,
      );
      return { error: "unavailable", orders: [] };
    }
  }
}

// GET /users-with-orders
app.get("/users-with-orders", async (req, res, next) => {
  try {
    // forward auth header to user service as well (optional)
    const headers = {};
    if (req.headers.authorization)
      headers.Authorization = req.headers.authorization;

    const usersResponse = await userClient.get("/users", { headers });
    const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];

    // use Promise.allSettled so one failing order fetch doesn't break the whole response
    const settled = await Promise.allSettled(
      users.map((user) =>
        fetchOrdersForUser(user.id, req.headers.authorization).then(
          (orders) => ({
            user,
            orders,
          }),
        ),
      ),
    );

    // pick only users that actually have orders (non-empty array)
    const usersWithOrders = settled
      .map((s) => {
        if (s.status !== "fulfilled") return null;
        const { user, orders } = s.value;
        // orders may be an object with error flag from fetchOrdersForUser
        if (orders && orders.error === "unavailable") return null;
        if (!Array.isArray(orders) || orders.length === 0) return null;
        return { ...user, orders };
      })
      .filter(Boolean);

    res.json(usersWithOrders);
  } catch (error) {
    console.error("API Gateway error:", error.message);
    // include minimal info for client, log full error server-side
    res.status(502).json({ message: "Error communicating with services" });
  }
});

// Proxy to create an order — frontend can POST here and the gateway forwards to order service.
// Body: { userId, product, id? }
// Authorization header (if present) is forwarded.
app.post("/orders", async (req, res) => {
  try {
    const headers = {};
    if (req.headers.authorization)
      headers.Authorization = req.headers.authorization;

    const response = await orderClient.post("/orders", req.body, { headers });
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Failed to create order via gateway:", err.message || err);
    if (err.response && err.response.data) {
      return res.status(err.response.status || 500).json(err.response.data);
    }
    res.status(500).json({ error: "Unable to create order" });
  }
});

// GET /users -> proxy to user service (for frontend)
app.get("/users", async (req, res) => {
  try {
    const headers = {};
    if (req.headers.authorization)
      headers.Authorization = req.headers.authorization;

    const response = await userClient.get("/users", { headers });
    res.json(Array.isArray(response.data) ? response.data : []);
  } catch (err) {
    console.error("Failed to fetch users via gateway:", err.message || err);
    if (err.response && err.response.data) {
      return res.status(err.response.status || 502).json(err.response.data);
    }
    res.status(502).json({ error: "Unable to fetch users" });
  }
});

// POST /users -> create user via user service
app.post("/users", async (req, res) => {
  try {
    const headers = {};
    if (req.headers.authorization)
      headers.Authorization = req.headers.authorization;

    const response = await userClient.post("/users", req.body, { headers });
    res.status(response.status || 201).json(response.data);
  } catch (err) {
    console.error("Failed to create user via gateway:", err.message || err);
    if (err.response && err.response.data) {
      return res.status(err.response.status || 500).json(err.response.data);
    }
    res.status(500).json({ error: "Unable to create user" });
  }
});

// GET /orders -> proxy to order service, passthrough query params (e.g. ?userId=)
app.get("/orders", async (req, res) => {
  try {
    const headers = {};
    if (req.headers.authorization)
      headers.Authorization = req.headers.authorization;

    const response = await orderClient.get("/orders", {
      params: req.query,
      headers,
    });
    res.json(Array.isArray(response.data) ? response.data : response.data);
  } catch (err) {
    console.error("Failed to fetch orders via gateway:", err.message || err);
    if (err.response && err.response.data) {
      return res.status(err.response.status || 502).json(err.response.data);
    }
    res.status(502).json({ error: "Unable to fetch orders" });
  }
});

// GET /orders/user/:userId -> return orders for a specific userId (uses order service ?userId=)
app.get("/orders/:userId", async (req, res) => {
  try {
    const headers = {};
    if (req.headers.authorization)
      headers.Authorization = req.headers.authorization;

    const userId = parseInt(req.params.userId, 10);
    if (Number.isNaN(userId))
      return res.status(400).json({ error: "invalid userId" });

    const response = await orderClient.get("/orders", {
      params: { userId },
      headers,
    });

    const orders = Array.isArray(response.data) ? response.data : [];
    res.json(orders);
  } catch (err) {
    console.error(
      "Failed to fetch orders for user via gateway:",
      err.message || err,
    );
    if (err.response && err.response.data) {
      return res.status(err.response.status || 502).json(err.response.data);
    }
    res.status(502).json({ error: "Unable to fetch orders" });
  }
});

// simple health
app.get("/health", (req, res) => res.json({ status: "ok" }));

// global error handler (fallback)
app.use((err, req, res, next) => {
  console.error("Unhandled error in gateway:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const server = app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

// graceful shutdown
function shutdown() {
  console.log("Shutting down API Gateway...");
  server.close(() => {
    console.log("API Gateway stopped.");
    process.exit(0);
  });
  // force exit after timeout
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
// ...existing code...
