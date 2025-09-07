import React, { useState, useEffect } from 'react';
import { apiService } from './apiService';

const styles = {
  card: { maxWidth: '500px', margin: '50px auto', padding: '30px', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', background: 'white' },
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', color: '#333' },
  input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
  btn: { padding: '10px', borderRadius: '5px', border: 'none', cursor: 'pointer' },
  btnPrimary: { background: '#667eea', color: 'white' },
  error: { color: 'red', marginBottom: '10px' },
  success: { color: 'green', marginBottom: '10px' },
  productCard: { border: '1px solid #ccc', padding: '10px', borderRadius: '5px', marginBottom: '10px',background: 'lightblue' },
};

function App() {
  const [currentPage, setCurrentPage] = useState('register');
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters] = useState({ category: '', minPrice: '', maxPrice: '', search: '' });


  useEffect(() => {
    if (currentPage === 'products') fetchProducts();
    if (currentPage === 'cart') fetchCart();
  }, [currentPage]);

  const fetchProducts = async () => {
    const res = await apiService.getProducts(filters);
    setProducts(res);
  };

  const fetchCart = async () => {
    const res = await apiService.getCart();
    setCart(res);
  };

  const handleAddToCart = async (productId) => {
    await apiService.addToCart(productId);
    fetchCart();
  };

  const handleRemoveFromCart = async (productId) => {
    await apiService.removeFromCart(productId);
    fetchCart();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentPage('login');
  };

  // ------------------ REGISTER COMPONENT ------------------
  const Register = ({ setCurrentPage }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }
      setLoading(true); setError(''); setSuccess('');
      const result = await apiService.register(formData);
      setLoading(false);
      if (result.error) setError(result.error);
      else { setSuccess('Account created! Redirecting to login.'); setTimeout(() => setCurrentPage('login'), 2000); }
    };

    return (
      <div style={styles.card}>
        <h2>Create Account</h2>
        <div style={styles.formGroup}>
          <label style={styles.label}>Full Name</label>
          <input style={styles.input} type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full Name" />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email" />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Password" />
        </div>
        <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleSubmit} disabled={loading}>{loading ? 'Creating...' : 'Sign Up'}</button>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}
        <p>Already have an account? <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => setCurrentPage('login')}>Login here</span></p>
      </div>
    );
  };

  // ------------------ LOGIN COMPONENT ------------------
  const Login = ({ setCurrentPage }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
      if (!formData.email || !formData.password) { setError('All fields required'); return; }
      setLoading(true); setError('');
      const result = await apiService.login(formData);
      setLoading(false);
      if (result.error) setError(result.error);
      else setCurrentPage('products');
    };

    return (
      <div style={styles.card}>
        <h2>Login</h2>
        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email" />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Password" />
        </div>
        <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleSubmit} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        {error && <div style={styles.error}>{error}</div>}
        <p>Don't have an account? <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => setCurrentPage('register')}>Register here</span></p>
      </div>
    );
  };

  // ------------------ PRODUCTS COMPONENT ------------------
  const Products = () => {
    return (
      <div style={{ maxWidth: '900px', margin: '20px auto' }}>
        <h2>Products</h2>
        <button onClick={() => setCurrentPage('cart')} style={{ marginBottom: '20px' }}>Go to Cart</button>
        <button onClick={handleLogout} style={{ marginLeft: '20px', marginBottom: '20px' }}>Logout</button>
        {products.map(product => (
          <div key={product.id} style={styles.productCard}>
             <img  src={product.image} alt={product.name}
             style={{ width: '200px', height: '200px', objectFit: 'cover' }}
        />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <button onClick={() => handleAddToCart(product.id)}>Add to Cart</button>
          </div>
        ))}
      </div>
    );
  };

  // ------------------ CART COMPONENT ------------------
  const Cart = () => {
    return (
      <div style={{ maxWidth: '900px', margin: '20px auto' }}>
        <h2>Your Cart</h2>
        <button onClick={() => setCurrentPage('products')} style={{ marginBottom: '20px' }}>Back to Products</button>
        {cart.length === 0 ? <p>Cart is empty</p> : cart.map(item => (
          <div key={item.id} style={styles.productCard}>
            <h3>{item.product.name}</h3>
            <p>Price: ${item.product.price}</p>
            <p>Quantity: {item.quantity}</p>
            <button onClick={() => handleRemoveFromCart(item.productId)}>Remove</button>
          </div>
        ))}
      </div>
    );
  };

  // ------------------ PAGE RENDER ------------------
  switch (currentPage) {
    case 'register': return <Register setCurrentPage={setCurrentPage} />;
    case 'login': return <Login setCurrentPage={setCurrentPage} />;
    case 'products': return <Products />;
    case 'cart': return <Cart />;
    default: return <Register setCurrentPage={setCurrentPage} />;
  }
}

export default App;
