import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [candies, setCandies] = useState([]);
  const [formData, setFormData] = useState({ name: '', price: '', description: '' });
  const [editId, setEditId] = useState(null);

  // Register form state
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' });

  // Fetch candies
  const fetchCandies = () => {
    fetch('http://localhost:5000/candies')
      .then(res => res.json())
      .then(data => setCandies(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchCandies();
  }, []);

  // Candy form handlers
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      alert('Please enter at least name and price.');
      return;
    }

    const method = editId ? 'PUT' : 'POST';
    const url = editId
      ? `http://localhost:5000/candies/${editId}`
      : 'http://localhost:5000/candies';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
        }),
      });

      if (!res.ok) throw new Error('Network response was not ok');

      setFormData({ name: '', price: '', description: '' });
      setEditId(null);
      fetchCandies();
    } catch (err) {
      alert('Error saving candy: ' + err.message);
    }
  };

  // Edit candy
  const handleEdit = candy => {
    setFormData({
      name: candy.name,
      price: candy.price,
      description: candy.description || '',
    });
    setEditId(candy.id);
  };

  // Delete candy
  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this candy?')) return;

    try {
      const res = await fetch(`http://localhost:5000/candies/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete candy');

      fetchCandies();
    } catch (err) {
      alert('Error deleting candy: ' + err.message);
    }
  };

  // Register form handlers
  const handleRegisterChange = e => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = e => {
    e.preventDefault();
    alert(`Registered user:\nUsername: ${registerData.username}\nEmail: ${registerData.email}`);
    // Here you can later add your backend API call for registration
    setRegisterData({ username: '', email: '', password: '' });
    setShowRegister(false);
  };

  return (
    <div className="app-container">
      <h1>Candy Shop 🍭</h1>

      <button onClick={() => setShowRegister(!showRegister)}>
        {showRegister ? 'Close Register' : 'Register'}
      </button>

      {showRegister && (
        <form onSubmit={handleRegisterSubmit} className="register-form">
          <input
            name="username"
            placeholder="Username"
            value={registerData.username}
            onChange={handleRegisterChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={registerData.email}
            onChange={handleRegisterChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={registerData.password}
            onChange={handleRegisterChange}
            required
          />
          <button type="submit">Submit</button>
        </form>
      )}

      <form onSubmit={handleSubmit} className="candy-form">
        <input
          name="name"
          placeholder="Candy Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          name="price"
          type="number"
          step="0.01"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <input
          name="description"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={handleChange}
        />
        <button type="submit">{editId ? 'Update Candy' : 'Add Candy'}</button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setFormData({ name: '', price: '', description: '' });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <ul className="candy-list">
        {candies.map(candy => (
          <li key={candy.id} className="candy-item">
            <div className="candy-name">{candy.name}</div>
            <div className="candy-price">${Number(candy.price).toFixed(2)}</div>
            <div className="candy-description">{candy.description}</div>
            <button onClick={() => handleEdit(candy)}>Edit</button>
            <button onClick={() => handleDelete(candy.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
