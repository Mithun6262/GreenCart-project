import React, { useState } from 'react';
import './user-form.css';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errMsg, setErrMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg('');

    if (form.password !== form.confirmPassword) {
      return setErrMsg('Passwords do not match');
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        return setErrMsg(data.message || 'Signup failed');
      }

      localStorage.setItem('token', data.token);
      navigate('/login'); // Redirect after signup
    } catch (err) {
      setErrMsg('Server error. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <form className="form-box" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        {errMsg && <p className="error-msg">{errMsg}</p>}

        <label>Username</label>
        <input
          type="text"
          name="username"
          value={form.username}
          required
          onChange={handleChange}
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          required
          onChange={handleChange}
        />

        <label>Phone</label>
        <input
          type="tel"
          name="phone"
          value={form.phone}
          required
          onChange={handleChange}
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          required
          onChange={handleChange}
        />

        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          required
          onChange={handleChange}
        />

        <button type="submit">Sign Up</button>

        {/* Navigation to Login Page */}
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#16A34A', textDecoration: 'underline' }}>
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
