import React, { useState } from 'react';
import './user-form.css';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return setErrMsg(data.message || 'Login failed');
      }

      // ✅ Save JWT token
      localStorage.setItem('token', data.token);

      // ✅ Optional: Save user info (if you want to)
      localStorage.setItem('user', JSON.stringify({
        id: data._id,
        username: data.username,
        role: data.role,
        email: data.email,
      }));

      // ✅ Redirect based on role
      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/home');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setErrMsg('Server error. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <form className="form-box" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {errMsg && <p className="error-msg">{errMsg}</p>}

        <label>Username</label>
        <input
          type="text"
          value={username}
          required
          onChange={(e) => setUsername(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>

        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Don’t have an account?{' '}
          <Link to="/signup" style={{ color: '#16A34A', textDecoration: 'underline' }}>
            Sign up here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
