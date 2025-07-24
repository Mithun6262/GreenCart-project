import React, { useEffect, useState } from 'react';
import './ViewUsers.css';

const ViewUsers = () => {
  const [users, setUsers] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    usersWithOrders: 0,
    usersWithoutOrders: 0
  });

  const fetchData = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setErrorMsg('Authorization token not found. Please login again.');
      setLoading(false);
      return;
    }

    try {
      const [usersRes, ordersRes] = await Promise.all([
        fetch('http://localhost:5000/api/auth/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('http://localhost:5000/api/order/confirmed', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
      ]);

      if (!usersRes.ok) {
        const errorText = await usersRes.text();
        throw new Error(`Failed to fetch users: ${errorText}`);
      }

      if (!ordersRes.ok) {
        const errorText = await ordersRes.text();
        throw new Error(`Failed to fetch orders: ${errorText}`);
      }

      const usersData = await usersRes.json();
      const ordersData = await ordersRes.json();

      const orderCountMap = {};
      let totalOrderCount = 0;

      ordersData.forEach(order => {
        const userId = order.user && order.user._id ? order.user._id : order.user;
        if (userId) {
          orderCountMap[userId] = (orderCountMap[userId] || 0) + 1;
          totalOrderCount++;
        }
      });

      const updatedUsers = usersData.map(user => ({
        ...user,
        totalOrders: orderCountMap[user._id] || 0,
      }));

      const usersWithOrders = updatedUsers.filter(u => u.totalOrders > 0).length;
      const usersWithoutOrders = updatedUsers.length - usersWithOrders;

      setUsers(updatedUsers);
      setTotalOrders(totalOrderCount);
      setSummary({
        totalUsers: updatedUsers.length,
        usersWithOrders,
        usersWithoutOrders
      });
    } catch (err) {
      console.error('Error loading data:', err);
      setErrorMsg(err.message || 'Unable to load users or orders.');
    } finally {
      setLoading(false);
    }
  };

  // 🔴 DELETE HANDLER
  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to delete user.');
      }

      // Remove from UI after delete
      setUsers(prev => prev.filter(user => user._id !== userId));
      setSummary(prev => ({
        ...prev,
        totalUsers: prev.totalUsers - 1,
        usersWithOrders: prev.usersWithOrders - (users.find(u => u._id === userId)?.totalOrders > 0 ? 1 : 0),
        usersWithoutOrders: prev.usersWithoutOrders - (users.find(u => u._id === userId)?.totalOrders === 0 ? 1 : 0),
      }));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="view-users-container">
      <h1>All Users</h1>

      {loading ? (
        <p>Loading...</p>
      ) : errorMsg ? (
        <p className="error">{errorMsg}</p>
      ) : (
        <>
          <div className="summary-cards">
            <div className="summary-card">Total Users: <strong>{summary.totalUsers}</strong></div>
            <div className="summary-card">Users with Orders: <strong>{summary.usersWithOrders}</strong></div>
            <div className="summary-card">Users without Orders: <strong>{summary.usersWithoutOrders}</strong></div>
            <div className="summary-card">Total Orders: <strong>{totalOrders}</strong></div>
          </div>

          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Total Orders</th>
                <th>Action</th> {/* 🔸 Added Action column */}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.role}</td>
                  <td>{user.totalOrders}</td>
                  <td>
                    <button onClick={() => handleDelete(user._id)} className="delete-btn">
                      Delete
                    </button>
                  </td> {/* 🔸 Delete button */}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ViewUsers;
