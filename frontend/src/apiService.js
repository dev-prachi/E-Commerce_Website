import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const apiService = {
  register: async (data) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, data);
      return res.data;
    } catch (err) {
      return { error: err.response?.data?.error || 'Registration failed' };
    }
  },

  login: async (data) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, data);
      if (res.data.token) localStorage.setItem('token', res.data.token);
      return res.data;
    } catch (err) {
      return { error: err.response?.data?.error || 'Login failed' };
    }
  },

  getProducts: async (filters = {}) => {
    try {
      const res = await axios.get(`${API_URL}/products`, { params: filters });
      return res.data;
    } catch (err) {
      return [];
    }
  },

  getCart: async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return [];
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/cart/add`, { productId, quantity }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return { error: err.response?.data?.error || 'Add to cart failed' };
    }
  },

  removeFromCart: async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${API_URL}/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return { error: err.response?.data?.error || 'Remove from cart failed' };
    }
  },
};
