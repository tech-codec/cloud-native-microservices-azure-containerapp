import React, { useState } from "react";
import Nav from "./components/Nav";
import UsersWithOrders from "./pages/UsersWithOrders";
import Users from "./pages/Users";
import Orders from "./pages/Orders";
import AddUser from "./pages/AddUser";
import AddOrder from "./pages/AddOrder";

export default function App() {
  const [view, setView] = useState("users-with-orders");

  return (
    <div className="container">
      <header className="header">
        <h1>Microservices Demo</h1>
      </header>

      <Nav view={view} onNavigate={setView} />

      <main style={{ marginTop: 16 }}>
        {view === "users-with-orders" && <UsersWithOrders />}
        {view === "users" && <Users />}
        {view === "orders" && <Orders />}
        {view === "add-user" && <AddUser onDone={() => setView("users")} />}
        {view === "add-order" && <AddOrder onDone={() => setView("orders")} />}
      </main>
    </div>
  );
}
