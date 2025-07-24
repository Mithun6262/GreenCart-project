import React, { useState } from 'react';
import axios from 'axios';
import './AddProduct.css';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    unit: 'kg',
    category: 'Fruits',
    image: '',
    stock: '',
    discount: '',
    topSelling: false
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('❌ No token found. Please log in again.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/products',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data._id) {
        setMessage('✅ Product added successfully');
        setFormData({
          name: '',
          price: '',
          unit: 'kg',
          category: 'Fruits',
          image: '',
          stock: '',
          discount: '',
          topSelling: false
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setMessage('❌ Product with the same name already exists.');
      } else if (error.response && error.response.status === 401) {
        setMessage('❌ Unauthorized: Please log in.');
      } else {
        setMessage('❌ Failed to add product');
      }
    }
  };

  return (
    <div className="add-product-container">
      <h2 className="add-product-heading">Add New Product</h2>
      <section className="add-product-form">
        <form onSubmit={handleSubmit}>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />

          <label>Price:</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" step="1" required />

          <label>Unit:</label>
          <select name="unit" value={formData.unit} onChange={handleChange}>
            <option value="kg">kg</option>
            <option value="l">liter</option>
            <option value="number">number</option>
          </select>

          <label>Category:</label>
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="Fruits">Fruits</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Dairy">Dairy</option>
            <option value="Beverages">Beverages</option>
            <option value="Bakery">Bakery</option>
            <option value="Meat">Meat</option>
            <option value="Snacks">Snack</option>
          </select>

          <label>Image URL:</label>
          <input type="text" name="image" value={formData.image} onChange={handleChange} />

          <label>Stock:</label>
          <input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" step="1" required />

          <label>Discount (%):</label>
          <input type="number" name="discount" value={formData.discount} onChange={handleChange} min="0" max="100" step="1" />

          <label className="checkbox-label">Mark as Top Selling
            <input type="checkbox" name="topSelling" checked={formData.topSelling} onChange={handleChange} />
          </label>

          <button type="submit">Add Product</button>

          {message && (
            <p className={`inline-message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </p>
          )}
        </form>
      </section>
    </div>
  );
};

export default AddProduct;
