import React, { useEffect, useState } from 'react';
import './AllOrders.css';

const AllOrder = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/order/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to fetch orders');
        }

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchOrders();
  }, []);

  const totalIncome = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="all-orders-page">
      <h2>Confirmed Orders</h2>
      {error && <div className="error">{error}</div>}
      {orders.length === 0 ? (
        <p>No confirmed orders found.</p>
      ) : (
        <>
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <strong>Order ID:</strong> {order._id}
                <span className="order-date">
                  {new Date(order.orderedAt).toLocaleString()}
                </span>
              </div>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div><strong>{item.name}</strong></div>
                    <div>Quantity: {item.quantity}</div>
                    <div>Price: ₹{item.price}</div>
                    <div>Total: ₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <strong>Total Amount: ₹{order.totalAmount}</strong>
              </div>
            </div>
          ))}

          {/* === BILLING SUMMARY === */}
          <div className="billing-summary">
            <h3>Billing Summary</h3>
            <p><strong>Total Orders:</strong> {orders.length}</p>
            <p><strong>Total Income:</strong> ₹{totalIncome}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default AllOrder;
