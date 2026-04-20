import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/users")
      .then((r) => setUsers(Array.isArray(r.data) ? r.data : []))
      .catch((e) => setError(e.message || "Error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error}</p>;
  if (users.length === 0) return <p>No users.</p>;

  return (
    <div>
      {users.map((u) => (
        <div key={u.id} className="user-card">
          <strong>{u.name}</strong> <span className="muted"> (id: {u.id})</span>
        </div>
      ))}
    </div>
  );
}
