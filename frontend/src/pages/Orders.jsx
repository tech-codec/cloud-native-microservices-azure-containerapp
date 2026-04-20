import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Orders() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = async () => {
    try {
      const r = await api.get("/users");
      setUsers(Array.isArray(r.data) ? r.data : []);
    } catch {
      setUsers([]);
    }
  };

  const loadOrders = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const params = userId ? { userId: Number(userId) } : {};
      const r = await api.get("/orders", { params });
      setOrders(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Unable to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadOrders(); // load all on mount
  }, []);

  const onChangeUser = (e) => {
    const id = e.target.value;
    setSelectedUserId(id);
    loadOrders(id);
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="message error">Error: {error}</p>;
  if (orders.length === 0)
    return (
      <div>
        <div className="form form-row inline" style={{ marginBottom: 12 }}>
          <label style={{ minWidth: 120 }}>Filter by user</label>
          <select value={selectedUserId} onChange={onChangeUser}>
            <option value="">All users</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} (id:{u.id})
              </option>
            ))}
          </select>
        </div>
        <p>No orders.</p>
      </div>
    );

  return (
    <div>
      <div className="form form-row inline" style={{ marginBottom: 16 }}>
        <label style={{ minWidth: 120 }}>Filter by user</label>
        <select value={selectedUserId} onChange={onChangeUser}>
          <option value="">All users</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} (id:{u.id})
            </option>
          ))}
        </select>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setSelectedUserId("");
            loadOrders();
          }}
          style={{ marginLeft: 8 }}
        >
          Clear
        </button>
      </div>

      <div className="card-grid orders-grid">
        {orders.map((o) => (
          <div
            key={o.id ?? `${o.product}-${Math.random()}`}
            className="card order-item"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 700 }}>{o.product}</div>
              <div className="small">Order #{o.id}</div>
            </div>
            <div className="meta">
              User ID: <strong>{o.userId}</strong>
            </div>
            <div className="meta small">Additional info can go here</div>
          </div>
        ))}
      </div>
    </div>
  );
}
