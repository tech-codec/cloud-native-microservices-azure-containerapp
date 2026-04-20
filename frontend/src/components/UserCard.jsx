import React from "react";

export default function UserCard({ user }) {
  return (
    <div className="user-card">
      <h3>
        {user.name} <small style={{ color: "#666" }}>(id: {user.id})</small>
      </h3>

      {user.ordersError && <p style={{ color: "red" }}>Orders unavailable</p>}

      {Array.isArray(user.orders) && user.orders.length > 0 ? (
        <ul className="order-list">
          {user.orders.map((o) => (
            <li key={o.id ?? `${o.product}-${Math.random()}`}>{o.product}</li>
          ))}
        </ul>
      ) : (
        <p>No orders</p>
      )}
    </div>
  );
}
