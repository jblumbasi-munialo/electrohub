// api/products.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = async function handler(req, res) {
  try {
    // Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        "priceKES" INTEGER NOT NULL,
        image TEXT NOT NULL,
        icon TEXT DEFAULT 'fa-box',
        rating REAL DEFAULT 4.5,
        supplier TEXT DEFAULT ''
      );
    `);

    // Seed initial data only once (if table is empty)
    const countResult = await pool.query('SELECT COUNT(*)::int AS count FROM products');
    if (countResult.rows[0].count === 0) {
      const defaultProducts = [
        { name: 'iPhone 15 Pro Max', category: 'Smartphone', priceKES: 179999, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80', icon: 'fa-mobile-alt', rating: 4.8 },
        { name: 'Samsung Galaxy S24 Ultra', category: 'Smartphone', priceKES: 164999, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80', icon: 'fa-mobile-alt', rating: 4.7 },
        { name: 'MacBook Air M3', category: 'Laptop', priceKES: 194999, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80', icon: 'fa-laptop', rating: 4.9 },
        { name: 'Dell XPS 15', category: 'Laptop', priceKES: 224999, image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&q=80', icon: 'fa-laptop', rating: 4.6 },
        { name: 'Sony WH-1000XM5', category: 'Headphone', priceKES: 52499, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80', icon: 'fa-headphones', rating: 4.7 },
        { name: 'AirPods Pro 2', category: 'Headphone', priceKES: 37499, image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&q=80', icon: 'fa-headphones', rating: 4.8 },
        { name: 'iPad Pro 12.9', category: 'Tablet', priceKES: 164999, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80', icon: 'fa-tablet-alt', rating: 4.9 },
        { name: 'Samsung Galaxy Tab S9', category: 'Tablet', priceKES: 134999, image: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb2?w=400&q=80', icon: 'fa-tablet-alt', rating: 4.5 },
        { name: 'Canon EOS R6', category: 'Camera', priceKES: 374999, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80', icon: 'fa-camera', rating: 4.8 },
        { name: 'GoPro Hero 12', category: 'Camera', priceKES: 59999, image: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400&q=80', icon: 'fa-camera', rating: 4.6 },
        { name: 'USB-C Hub 7-in-1', category: 'Accessory', priceKES: 7349, image: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400&q=80', icon: 'fa-plug', rating: 4.4 },
        { name: 'Wireless Charger Pad', category: 'Accessory', priceKES: 4349, image: 'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=400&q=80', icon: 'fa-charging-station', rating: 4.3 }
      ];
      for (const p of defaultProducts) {
        await pool.query(
          'INSERT INTO products (name, category, "priceKES", image, icon, rating) VALUES ($1, $2, $3, $4, $5, $6)',
          [p.name, p.category, p.priceKES, p.image, p.icon, p.rating]
        );
      }
    }

    // GET request – return all products
    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM products ORDER BY id');
      return res.status(200).json(result.rows);
    }

    // POST request – add new product (admin only)
    if (req.method === 'POST') {
      const adminKey = req.headers['x-admin-key'];
      if (adminKey !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { name, category, priceKES, image, icon, rating, supplier } = req.body;
      if (!name || !category || !priceKES || !image) {
        return res.status(400).json({ error: 'Missing required fields: name, category, priceKES, image' });
      }
      const result = await pool.query(
        'INSERT INTO products (name, category, "priceKES", image, icon, rating, supplier) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [name, category, priceKES, image, icon || 'fa-box', rating || 4.5, supplier || '']
      );
      return res.status(201).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
