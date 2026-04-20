import React from "react";

const OrderList = ({ orders }) => {
  if (!orders || orders.length === 0) {
    return <p>No orders available.</p>;
  }

  return (
    <ul>
      {orders.map((order) => (
        <li key={order.id}>Product: {order.product}</li>
      ))}
    </ul>
  );
};

export default OrderList;
