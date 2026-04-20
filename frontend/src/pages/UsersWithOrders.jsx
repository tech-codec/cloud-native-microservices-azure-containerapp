import React, { useEffect, useState } from "react";
import api from "../services/api";
import UserCard from "../components/UserCard";

export default function UsersWithOrders() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/users-with-orders")
      .then((res) => {
        console.log("API RESPONSE:", res.data);

        //FORCE ARRAY SAFETY
        const safeData = Array.isArray(res.data) ? res.data : [];

        setData(safeData);
      })
      .catch((err) => {
        console.error(err);
        setData([]);
        setError(err.message || "Error");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!Array.isArray(data) || data.length === 0) return <p>No users found.</p>;

  return (
    <div>
      {/*EXTRA PROTECTION */}
      {Array.isArray(data) &&
        data.map((user) => <UserCard key={user.id} user={user} />)}
    </div>
  );
}
