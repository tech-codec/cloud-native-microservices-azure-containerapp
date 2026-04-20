import React from "react";

export default function Nav({ view, onNavigate }) {
  const btn = (id, label) => (
    <button
      className={view === id ? "nav-btn active" : "nav-btn"}
      onClick={() => onNavigate(id)}
      type="button"
    >
      {label}
    </button>
  );

  return (
    <nav className="nav">
      {btn("users-with-orders", "Users with Orders")}
      {btn("users", "All Users")}
      {btn("orders", "All Orders")}
      {btn("add-user", "Add User")}
      {btn("add-order", "Add Order")}
    </nav>
  );
}
