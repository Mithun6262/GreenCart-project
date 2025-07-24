import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './SidebarLayout.css';

const SidebarLayout = () => {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">GreenCart Admin</div>
        <ul>
          <li>
            <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/add-product" className={({ isActive }) => isActive ? 'active' : ''}>
              Add Product
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/viewproduct" className={({ isActive }) => isActive ? 'active' : ''}>
              View Products
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active' : ''}>
              Orders
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/view-users" className={({ isActive }) => isActive ? 'active' : ''}>
              Users
            </NavLink>
          </li>
        </ul>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;
