import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import axios from 'axios';
import {
  FaUserCircle
} from 'react-icons/fa';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const Dashboard = () => {
  const [showLogout, setShowLogout] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    outOfStock: 0,
    pendingDeliveries: 0,
  });
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  const toggleLogout = () => setShowLogout(!showLogout);
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { headers: { Authorization: `Bearer ${token}` } };

    const fetchAll = async () => {
      try {
        const [
          userRes,
          prodRes,
          orderRes,
          recRes,
          stockRes,
          salesRes
        ] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/users', headers),
          axios.get('http://localhost:5000/api/products', headers),
          axios.get('http://localhost:5000/api/order/all', headers),
          axios.get('http://localhost:5000/api/dashboard/recent-orders', headers),
          axios.get('http://localhost:5000/api/dashboard/low-stock-alerts', headers),
          axios.get('http://localhost:5000/api/dashboard/daily-sales', headers),
        ]);

        const users = userRes.data;
        const products = prodRes.data;
        const orders = orderRes.data;
        const recent = recRes.data;
        const lowStock = stockRes.data;
        const dailySales = salesRes.data;

        const totalRevenue = orders
          .filter(o => o.status === 'confirmed')
          .reduce((a, c) => a + c.totalAmount, 0);
        const outOfStock = products.filter(p => p.stock <= 0).length;
        const pending = orders.filter(o => o.status !== 'confirmed').length;

        setStats({
          totalUsers: users.length,
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue,
          outOfStock,
          pendingDeliveries: pending,
        });

        setSalesData(dailySales.map(d => ({ date: d.date, sales: d.total })));

        const categoryMap = {};
        products.forEach(p => categoryMap[p.category] = (categoryMap[p.category] || 0) + 1);
        setCategoryData(Object.entries(categoryMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)
        );

        const signupMap = {};
        users.forEach(u => {
          const m = new Date(u.createdAt).toISOString().slice(0, 10);
          signupMap[m] = (signupMap[m] || 0) + 1;
        });
        setUserGrowth(Object.entries(signupMap)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date))
        );

        setRecentOrders(recent);
        setLowStockAlerts(lowStock);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      }
    };

    fetchAll();
  }, []);

  const pieColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

  return (
    <div className="admin-dashboard">
      <div className="topbar">
        <div className="top-icons">
          <div className="profile-icon-wrapper" onClick={toggleLogout}>
            <FaUserCircle className="icon" />
            {showLogout && (
              <div className="logout-popup">
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-overview">
        {Object.entries(stats).map(([key, value]) => (
          <div className="overview-card" key={key}>
            <h3>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
            <p>{key === 'totalRevenue' ? `₹${value.toLocaleString()}` : value}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-charts">
        <div className="chart-box">
          <h3>Daily Sales</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#FF8C00" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>New Users Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFA500" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FFA500" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#FFA500" fillOpacity={1} fill="url(#colorUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>Top Categories</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {categoryData.map((e, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-table">
        <h3>Recent Orders</h3>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Mail ID</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>No recent orders</td></tr>
            ) : (
              recentOrders.map(o => (
                <tr key={o.id}>
                  <td>{o.id.slice(0, 6)}…</td>
                  <td>{o.userEmail || 'User'}</td>
                  <td>₹{o.total}</td>
                  <td>{new Date(o.date).toLocaleDateString()}</td>
                  <td><span className={`status ${o.status.toLowerCase()}`}>{o.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="dashboard-alerts">
        <h3>Low Stock Alerts</h3>
        {lowStockAlerts.length === 0 ? (
          <p>No low stock items 🎉</p>
        ) : (
          <ul>
            {lowStockAlerts.map(p => (
              <li key={p._id}>{p.name} — Only {p.stock} left</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
