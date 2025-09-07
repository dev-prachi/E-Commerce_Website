// server.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
let users = [];
let products = [
    {
        id: '1',
        name: 'Wireless Headphones',
        price: 99.99,
        category: 'electronics',
        description: 'Premium wireless headphones with noise cancellation',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
        stock: 50
    },
    {
        id: '2',
        name: 'Smart Watch',
        price: 249.99,
        category: 'electronics',
        description: 'Advanced fitness tracking and smart notifications',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
        stock: 30
    },
    {
        id: '3',
        name: 'Cotton T-Shirt',
        price: 29.99,
        category: 'clothing',
        description: '100% organic cotton comfortable t-shirt',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300',
        stock: 100
    },
    {
        id: '4',
        name: 'Denim Jeans',
        price: 79.99,
        category: 'clothing',
        description: 'Classic fit denim jeans with premium quality',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300',
        stock: 75
    },
    {
        id: '5',
        name: 'JavaScript Guide',
        price: 39.99,
        category: 'books',
        description: 'Comprehensive guide to modern JavaScript development',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300',
        stock: 200
    },
    {
        id: '6',
        name: 'Cooking Essentials',
        price: 19.99,
        category: 'books',
        description: 'Master the art of cooking with essential techniques',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300',
        stock: 150
    },
    {
        id: '7',
        name: 'Plant Pot',
        price: 24.99,
        category: 'home',
        description: 'Beautiful ceramic pot perfect for indoor plants',
        image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300',
        stock: 80
    },
    {
        id: '8',
        name: 'LED Desk Lamp',
        price: 59.99,
        category: 'home',
        description: 'Adjustable LED lamp with multiple brightness settings',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300',
        stock: 45
    }
];
let carts = {}; // userId -> cart items

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// AUTH ROUTES

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = {
            id: uuidv4(),
            name,
            email,
            password: hashedPassword,
            createdAt: new Date()
        };

        users.push(user);

        // Initialize empty cart for user
        carts[user.id] = [];

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = users.find(user => user.email === email);
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PRODUCT ROUTES

// Get all products with filters
app.get('/api/products', (req, res) => {
    try {
        const { category, minPrice, maxPrice, search } = req.query;
        let filteredProducts = [...products];

        // Apply filters
        if (category) {
            filteredProducts = filteredProducts.filter(product => 
                product.category.toLowerCase() === category.toLowerCase()
            );
        }

        if (minPrice) {
            filteredProducts = filteredProducts.filter(product => 
                product.price >= parseFloat(minPrice)
            );
        }

        if (maxPrice) {
            filteredProducts = filteredProducts.filter(product => 
                product.price <= parseFloat(maxPrice)
            );
        }

        if (search) {
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(search.toLowerCase()) ||
                product.description.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.json(filteredProducts);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    try {
        const product = products.find(p => p.id === req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create product (admin only - simplified for demo)
app.post('/api/products', authenticateToken, (req, res) => {
    try {
        const { name, price, category, description, image, stock } = req.body;

        if (!name || !price || !category) {
            return res.status(400).json({ error: 'Name, price, and category are required' });
        }

        const product = {
            id: uuidv4(),
            name,
            price: parseFloat(price),
            category,
            description: description || '',
            image: image || '',
            stock: stock || 0,
            createdAt: new Date()
        };

        products.push(product);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update product
app.put('/api/products/:id', authenticateToken, (req, res) => {
    try {
        const productIndex = products.findIndex(p => p.id === req.params.id);
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const { name, price, category, description, image, stock } = req.body;
        
        products[productIndex] = {
            ...products[productIndex],
            ...(name && { name }),
            ...(price && { price: parseFloat(price) }),
            ...(category && { category }),
            ...(description !== undefined && { description }),
            ...(image !== undefined && { image }),
            ...(stock !== undefined && { stock }),
            updatedAt: new Date()
        };

        res.json(products[productIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete product
app.delete('/api/products/:id', authenticateToken, (req, res) => {
    try {
        const productIndex = products.findIndex(p => p.id === req.params.id);
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }

        products.splice(productIndex, 1);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// CART ROUTES

// Get user's cart
app.get('/api/cart', authenticateToken, (req, res) => {
    try {
        const userCart = carts[req.user.userId] || [];
        
        // Populate with product details
        const cartWithProducts = userCart.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                ...item,
                product
            };
        }).filter(item => item.product); // Filter out items with deleted products

        res.json(cartWithProducts);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Add item to cart
app.post('/api/cart/add', authenticateToken, (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        // Check if product exists
        const product = products.find(p => p.id === productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Initialize cart if it doesn't exist
        if (!carts[req.user.userId]) {
            carts[req.user.userId] = [];
        }

        const userCart = carts[req.user.userId];
        const existingItem = userCart.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            userCart.push({
                id: uuidv4(),
                productId,
                quantity,
                addedAt: new Date()
            });
        }

        res.json({ message: 'Item added to cart', cartCount: userCart.length });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update cart item quantity
app.put('/api/cart/update', authenticateToken, (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).json({ error: 'Product ID and quantity are required' });
        }

        const userCart = carts[req.user.userId] || [];
        const itemIndex = userCart.findIndex(item => item.productId === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        if (quantity <= 0) {
            userCart.splice(itemIndex, 1);
        } else {
            userCart[itemIndex].quantity = quantity;
        }

        res.json({ message: 'Cart updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove item from cart
app.delete('/api/cart/remove/:productId', authenticateToken, (req, res) => {
    try {
        const { productId } = req.params;
        const userCart = carts[req.user.userId] || [];
        
        const itemIndex = userCart.findIndex(item => item.productId === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        userCart.splice(itemIndex, 1);
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Clear cart
app.delete('/api/cart/clear', authenticateToken, (req, res) => {
    try {
        carts[req.user.userId] = [];
        res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;

// package.json
/*
{
  "name": "ecommerce-backend",
  "version": "1.0.0",
  "description": "E-commerce backend with Express.js",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
*/