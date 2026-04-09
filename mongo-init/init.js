// switch to orders database
db = db.getSiblingDB("ordersdb");

// create application user (NOT root)
db.createUser({
  user: "admin123",
  pwd: "Admin123",
  roles: [{ role: "readWrite", db: "ordersdb" }],
});

// insert seed data
db.orders.insertMany([
  { userId: 1, product: "Laptop" },
  { userId: 2, product: "Phone" },
  { userId: 2, product: "Tablet" },
  { userId: 2, product: "Monitor" },
  { userId: 3, product: "Bike" },
  { userId: 3, product: "Car" },
  { userId: 1, product: "Motorcycle" },
]);
