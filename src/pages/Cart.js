import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, saveCart, updateQuantity } from '../utils/cartUtils';
import './Cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  const handleUpdateQuantity = (id, delta) => {
    updateQuantity(id, delta);
    setCartItems(getCart());
  };

  const removeItem = (id) => {
    const updated = getCart().filter(item => item._id !== id);
    saveCart(updated);
    setCartItems(updated);
  };

  const clearAllItems = () => {
    const confirmed = window.confirm('Are you sure you want to clear all items from the cart?');
    if (!confirmed) return;
    saveCart([]);
    setCartItems([]);
  };

  const getTotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
      return acc + price * item.quantity;
    }, 0).toFixed(2);
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');

    if (!token || token === 'undefined' || token === null) {
      alert('❌ Please log in to continue.');
      navigate('/login');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to place the order?');
    if (!confirmed) return;

    setProcessing(true);

    try {
      const response = await fetch('http://localhost:5000/api/order/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cartItems,
          totalAmount: parseFloat(getTotal())
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Order placed successfully!');
        localStorage.removeItem('cart');
        setCartItems([]);
        navigate('/home');
      } else {
        alert('❌ Checkout failed: ' + data.message);
      }
    } catch (error) {
      alert('❌ An error occurred during checkout. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <div className="cart-page">
      <div className="cart-header">
        <button className="back-button" onClick={handleBack}>← Continue Shopping</button>
        {cartItems.length > 0 && (
          <button className="clear-all-button" onClick={clearAllItems}>Clear All</button>
        )}
      </div>

      <h2 className="cart-title">Your Cart</h2>

      <div className="cart-grid">
        {Array.isArray(cartItems) && cartItems.map(item => {
          const discountedPrice = item.discount > 0
            ? (item.price * (1 - item.discount / 100)).toFixed(2)
            : item.price.toFixed(2);
          return (
            <div key={item._id} className="cart-card">
              <img src={item.image} alt={item.name} className="cart-image" />
              <div className="cart-info">
                <h3>{item.name}</h3>
                <p>Unit: {item.unit}</p>
                {item.discount > 0 ? (
                  <p className="price">
                    <span className="original">₹{item.price.toFixed(2)}</span>{' '}
                    <span className="discounted">₹{discountedPrice}</span>
                  </p>
                ) : (
                  <p className="discounted">₹{item.price.toFixed(2)}</p>
                )}
              </div>
              <div className="cart-controls">
                <div className="quantity-control">
                  <button className="quantity-btn" onClick={() => handleUpdateQuantity(item._id, -1)}>-</button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button className="quantity-btn" onClick={() => handleUpdateQuantity(item._id, 1)}>+</button>
                </div>
                <button className="remove" onClick={() => removeItem(item._id)}>Remove</button>
              </div>
            </div>
          );
        })}
      </div>

      {Array.isArray(cartItems) && cartItems.length > 0 && (
        <div className="cart-total-box">
          <h3>Billing Details</h3>
          <div className="billing-items">
            {cartItems.map(item => {
              const price = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
              return (
                <div key={item._id} className="billing-item">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{(price * item.quantity).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
          <h3>Total: ₹{getTotal()}</h3>
          <button className="checkout-btn" onClick={handleCheckout} disabled={processing}>
            {processing ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
