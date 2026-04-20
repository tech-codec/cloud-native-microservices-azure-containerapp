import React, { useState } from "react";
import api from "../services/api";

export default function AddUser({ onDone }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setMsg("Name required");
    setBusy(true);
    try {
      const resp = await api.post("/users", { name: name.trim() });
      setMsg(`Created user id=${resp.data.id}`);
      setName("");
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
          Name:
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={busy}
          />
        </label>
      </div>
      <div style={{ marginTop: 8 }}>
        <button type="submit" disabled={busy}>
          Create User
        </button>
      </div>
      {msg && <p>{msg}</p>}
    </form>
  );
}
