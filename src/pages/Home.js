import React, { useEffect, useState, useRef } from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import {
  getQuantity,
  addToCart,
  updateQuantity
} from '../utils/cartUtils';

const Home = () => {
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartUpdated, setCartUpdated] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    fetch('http://localhost:5000/api/products?discount=true')
      .then(res => res.json())
      .then(data => {
        // ✅ Sort by discount descending
        const sorted = data.sort((a, b) => b.discount - a.discount);
        setDiscountedProducts(sorted);
      })
      .catch(err => console.error('Failed to fetch discounted products', err));

    fetch('http://localhost:5000/api/products?topSelling=true')
      .then(res => res.json())
      .then(data => setTopSellingProducts(data))
      .catch(err => console.error('Failed to fetch top selling products', err));
  }, [cartUpdated]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      navigate(`/searchresults?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/searchresults?query=${encodeURIComponent(category)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/home');
  };

  const focusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const renderProductCard = (product, isDiscount = false) => {
    const quantity = getQuantity(product._id);

    const handleQtyChange = (delta) => {
      updateQuantity(product._id, delta);
      setCartUpdated(prev => !prev);
    };

    const handleAddToCart = () => {
      addToCart(product);
      setCartUpdated(prev => !prev);
    };

    return (
      <div key={product._id} className="product-card">
        {isDiscount && product.discount > 0 && (
          <div className="discount-badge">🔴 {product.discount}% OFF</div>
        )}
        <img src={product.image} alt={product.name} />
        <h4>{product.name}</h4>
        <p className="unit">Unit: {product.unit}</p>
        <p className="price">
          {isDiscount && product.discount > 0 && (
            <span className="original">₹{product.price.toFixed(2)}</span>
          )}
          ₹{(product.price * (1 - product.discount / 100)).toFixed(2)}
        </p>
        {quantity > 0 ? (
          <div className="quantity-container">
            <button className="qty-btn" onClick={() => handleQtyChange(-1)}>-</button>
            <span className="qty-count">{quantity}</span>
            <button className="qty-btn" onClick={() => handleQtyChange(1)}>+</button>
          </div>
        ) : (
          <button className="add-cart-btn" onClick={handleAddToCart}>Add to Cart</button>
        )}
      </div>
    );
  };

  return (
    <div className="home">
      {/* Header */}
      <header className="header">
        <div className="logo">🔆 Grocery</div>
        <input
          type="text"
          className="search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          ref={searchInputRef}
        />
        <div className="header-links">
          {isLoggedIn ? (
            <span onClick={handleLogout}>Logout</span>
          ) : (
            <span onClick={() => navigate('/login')}>Sign In</span>
          )}
          <span onClick={() => navigate('/cart')}>🛒 Cart</span>
        </div>
      </header>

      {/* Banner */}
      <section className="banner">
        <div className="banner-content">
          <h2>Your one-stop shop for fresh groceries delivered to your door</h2>
          <button className="shop-now-btn" onClick={focusSearchInput}>
            🛍️ Shop Now
          </button>
        </div>
      </section>

      {/* Marquee-style Category Row */}
      <div className="category-scroll-wrapper">
        <div className="category-scroll-content">
          {['Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Meat', 'Snacks'].map(cat => (
            <span
              key={cat}
              className="category-icon"
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Discount Section */}
      <section className="section">
        <h3>🛍 Today’s Deals. Tomorrow? Gone.</h3>
        <p>Enjoy exclusive discounts on our most loved items — only for a limited time!</p>
        <div className="product-grid">
          {discountedProducts.map(product => renderProductCard(product, true))}
        </div>
      </section>

      {/* Top Selling Section */}
      <section className="section">
        <h3>🔝 Top Selling Products</h3>
        <div className="product-grid">
          {topSellingProducts.map(product => renderProductCard(product))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="search-cta">
        <h3>🔍 Can’t find what you’re looking for?</h3>
        <p>Search thousands of items available at your fingertips!</p>
        <button className="start-search-btn" onClick={focusSearchInput}>
          Start Searching 🔎
        </button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <span>About Us</span>
          <span>Contact Us</span>
          <span>Privacy Policy</span>
        </div>
        <p>© 2025 Grocery Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
