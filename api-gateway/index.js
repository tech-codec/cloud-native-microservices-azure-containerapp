// ...existing code...
const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

require("dotenv").config();

// create clients with timeouts and easy baseURL changes (works in k8s/docker with service names)
const userClient = axios.create({
  baseURL: process.env.USER_SERVICE_URL,
  timeout: 3000,
});
const orderClient = axios.create({
  baseURL: process.env.ORDER_SERVICE_URL,
  timeout: 3000,
});

app.get("/users-with-orders", async (req, res) => {
  try {
    const usersResponse = await userClient.get("/users");
    const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];

    const results = await Promise.all(
      users.map(async (user) => {
        // prefer query param route supported by order service, fallback to legacy path
        try {
          const ordersResponse = await orderClient.get("/orders", {
            params: { userId: user.id },
          });
          return { ...user, orders: ordersResponse.data };
        } catch (errFirst) {
          try {
            const ordersResponse2 = await orderClient.get(`/orders/${user.id}`);
            return { ...user, orders: ordersResponse2.data };
          } catch (errSecond) {
            console.error(
              `Failed to fetch orders for user ${user.id}:`,
              errSecond.message,
            );
            // don't fail the whole batch — return empty orders and an indicator
            return { ...user, orders: [], ordersError: "unavailable" };
          }
        }
      }),
    );

    res.json(results);
  } catch (error) {
    console.error("API Gateway error:", error.message);
    res.status(502).json({ message: "Error communicating with services" });
  }
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
//
