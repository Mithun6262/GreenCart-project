// src/pages/admin/ViewProduct.js
import React, { useEffect, useState, useCallback } from 'react';
import './ViewProducts.css';
import axios from 'axios';

const ViewProduct = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error("❌ Backend not connected or failed:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchProducts(); // Refresh the list
    } catch (err) {
      console.error("❌ Delete failed:", err);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct({ ...product });
  };

  const handleCloseEdit = () => {
    setEditingProduct(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/products/${editingProduct._id}`,
        editingProduct,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      fetchProducts();
      handleCloseEdit();
    } catch (err) {
      console.error("❌ Failed to update product:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct(prev => ({
      ...prev,
      [name]: ['price', 'stock', 'discount'].includes(name)
        ? value === '' ? '' : Number(value)
        : value
    }));
  };

  return (
    <div className="view-products-page">
      <h2>Product List</h2>

      <input
        type="text"
        placeholder="Search by product name..."
        className="product-search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="product-grid">
        {filtered.map(product => {
          const hasDiscount = product.discount > 0;
          const originalPrice = hasDiscount
            ? Math.round(product.price / (1 - product.discount / 100))
            : product.price;

          return (
            <div key={product._id} className="product-card">
              {hasDiscount && <div className="discount-badge">-{product.discount}%</div>}

              <img
                src={product.image || '/default-product.png'}
                alt={product.name}
                className="product-image"
              />
              <div className="product-info">
                <h3>{product.name}</h3>

                <div className="product-price">
                  {hasDiscount && (
                    <span className="original-price">₹{originalPrice}</span>
                  )}
                  <span className="discounted-price">
                    ₹{product.price} / {product.unit}
                  </span>
                </div>

                <div className="product-actions">
                  <button onClick={() => handleEdit(product)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(product._id)} className="delete-btn">Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingProduct && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <h3>Edit Product</h3>
            <form onSubmit={handleUpdate}>
              <label>
                Name:
                <input
                  name="name"
                  value={editingProduct.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Unit:
                <input
                  name="unit"
                  value={editingProduct.unit}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Price:
                <input
                  name="price"
                  type="number"
                  value={editingProduct.price}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Discount (%):
                <input
                  name="discount"
                  type="number"
                  value={editingProduct.discount || 0}
                  onChange={handleChange}
                />
              </label>

              <label>
                Stock:
                <input
                  name="stock"
                  type="number"
                  value={editingProduct.stock}
                  onChange={handleChange}
                />
              </label>

              <label>
                Image URL:
                <input
                  name="image"
                  value={editingProduct.image}
                  onChange={handleChange}
                />
              </label>

              <div className="modal-buttons">
                <button type="submit">Update</button>
                <button type="button" className="cancel-btn" onClick={handleCloseEdit}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProduct;
