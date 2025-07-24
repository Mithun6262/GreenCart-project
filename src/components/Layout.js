import React from 'react';
import { Outlet } from 'react-router-dom'; // ✅ Import Outlet
import './Layout.css';

function Layout() {
  return (
    <div className="layout-container">
      <main className="layout-main">
        <Outlet /> {/* ✅ Render child route content */}
      </main>
    </div>
  );
}

export default Layout;
