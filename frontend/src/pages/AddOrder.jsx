import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function AddOrder({ onDone }) {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [product, setProduct] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api
      .get("/users")
      .then((r) => setUsers(Array.isArray(r.data) ? r.data : []))
      .catch(() => setUsers([]));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!userId || !product.trim()) return setMsg("user and product required");
    setBusy(true);
    try {
      const resp = await api.post("/orders", {
        userId: Number(userId),
        product: product.trim(),
      });
      setMsg(`Order created id=${resp.data.id}`);
      setProduct("");
      if (onDone) setTimeout(onDone, 700);
    } catch (err) {
      setMsg(err.response?.data?.error || err.message || "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div>
        <label>
          User:
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            disabled={busy}
          >
            <option value="">-- select user --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} (id:{u.id})
              </option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ marginTop: 8 }}>
        <label>
          Product:
          <input
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            disabled={busy}
          />
        </label>
      </div>
      <div style={{ marginTop: 8 }}>
        <button type="submit" disabled={busy}>
          Create Order
        </button>
      </div>
      {msg && <p>{msg}</p>}
    </form>
  );
}
