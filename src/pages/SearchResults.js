import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getCart,
  addToCart,
  updateQuantity,
  getQuantity
} from "../utils/cartUtils";
import "./SearchResults.css";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get("query") || "";
  const [results, setResults] = useState([]);
  const [cartItems, setCartItems] = useState(getCart());

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/search?query=${query}`);
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      }
    };

    if (query.trim()) fetchResults();
  }, [query]);

  const calculateDiscountedPrice = (price, discount) =>
    (price * (1 - discount / 100)).toFixed(2);

  const refreshCart = () => {
    setCartItems(getCart());
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    refreshCart();
  };

  const handleIncrease = (productId) => {
    updateQuantity(productId, 1);
    refreshCart();
  };

  const handleDecrease = (productId) => {
    updateQuantity(productId, -1);
    refreshCart();
  };

  const isInCart = (productId) => {
    return cartItems.some((item) => item._id === productId);
  };

  return (
    <div className="search-results-page">
      <div className="search-results-header">
        <button className="icon-round-btn" onClick={() => navigate("/")}>←</button>
        <button className="icon-round-btn" onClick={() => navigate("/cart")}>🛒</button>
      </div>

      <h2 className="search-heading">Search Results for "{query}"</h2>

      {results.length === 0 ? (
        <p className="no-results">No matching products found.</p>
      ) : (
        <div className="product-grid">
          {results.map((product) => {
            const quantity = getQuantity(product._id);
            const inCart = isInCart(product._id);
 
            return (
              <div key={product._id} className="product-card">
                {product.discount > 0 && (
                  <span className="discount-badge">{product.discount}% OFF</span>
                )}
                <img src={product.image} alt={product.name} className="product-image" />
                <h3 className="product-name">{product.name}</h3>
                <p className="unit-text">Unit: {product.unit}</p>

                <div className="price-section">
                  {product.discount > 0 ? (
                    <>
                      <span className="original-price">₹{product.price.toFixed(2)}</span>
                      <span className="discounted-price">
                        ₹{calculateDiscountedPrice(product.price, product.discount)}
                      </span>
                    </>
                  ) : (
                    <span className="discounted-price">₹{product.price.toFixed(2)}</span>
                  )}
                </div>

                <div className="add-to-cart-section">
                  {!inCart ? (
                    <button className="quantity-btn" onClick={() => handleAddToCart(product)}>
                      Add to Cart
                    </button>
                  ) : (
                    <div className="quantity-control">
                      <button className="quantity-btn" onClick={() => handleDecrease(product._id)}>-</button>
                      <span className="quantity-value">{quantity}</span>
                      <button className="quantity-btn" onClick={() => handleIncrease(product._id)}>+</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
