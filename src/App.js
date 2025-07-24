import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import AddProduct from './pages/AddProduct';
import Home from './pages/Home';
import Cart from './pages/Cart';
import SearchResults from './pages/SearchResults';
import Layout from './components/Layout';
import SidebarLayout from './components/SidebarLayout';
import Dashboard from './pages/Dashboard';
import ViewProducts from './pages/ViewProducts';
import ViewUsers from './pages/ViewUsers';
import AllOrders from './pages/AllOrders';

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ User layout with nested routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="signup" element={<Signup />} />
          <Route path="login" element={<Login />} />
          <Route path="home" element={<Home />} />
          <Route path="cart" element={<Cart />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="searchresults" element={<SearchResults />} />
        </Route>

        {/* ✅ Admin layout with nested routes */}
        <Route path="/admin" element={<SidebarLayout />}>
          <Route path="add-product" element={<AddProduct />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="viewproduct" element={<ViewProducts />} />
          <Route path="orders" element={<AllOrders />} />
          <Route path="view-users" element={<ViewUsers />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
