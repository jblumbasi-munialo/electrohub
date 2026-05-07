// api/products.js
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = async function handler(req, res) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        "priceKES" INTEGER NOT NULL,
        image TEXT NOT NULL,
        icon TEXT DEFAULT 'fa-box',
        rating REAL DEFAULT 4.5,
        supplier TEXT DEFAULT '',
        description TEXT DEFAULT ''
      );
    `);

    // Seed if empty (same as before, skip for brevity)
    // ... (keep the seed default products)

    // GET all products
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM products ORDER BY id');
      return res.status(200).json(rows);
    }

    // POST – add product (admin only)
    if (req.method === 'POST') {
      const adminKey = req.headers['x-admin-key'];
      if (adminKey !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { name, category, priceKES, image, icon, rating, supplier, description } = req.body;
      if (!name || !category || !priceKES || !image) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const { rows: newRow } = await pool.query(
        `INSERT INTO products (name, category, "priceKES", image, icon, rating, supplier, description)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [name, category, priceKES, image, icon||'fa-box', rating||4.5, supplier||'', description||'']
      );
      return res.status(201).json(newRow[0]);
    }

    // PUT – update product (admin only)
    if (req.method === 'PUT') {
      const adminKey = req.headers['x-admin-key'];
      if (adminKey !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
      const { id, name, category, priceKES, image, icon, rating, supplier, description } = req.body;
      if (!id) return res.status(400).json({ error: 'Product ID required' });
      const updates = [];
      const values = [];
      let idx = 1;
      for (const [key, val] of Object.entries({ name, category, priceKES, image, icon, rating, supplier, description })) {
        if (val !== undefined) {
          updates.push(`"${key}"=$${idx}`);
          values.push(val);
          idx++;
        }
      }
      if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
      values.push(id);
      const query = `UPDATE products SET ${updates.join(', ')} WHERE id=$${idx} RETURNING *`;
      const { rows } = await pool.query(query, values);
      if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
      return res.status(200).json(rows[0]);
    }

    // DELETE – remove product (admin only)
    if (req.method === 'DELETE') {
      const adminKey = req.headers['x-admin-key'];
      if (adminKey !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Product ID required' });
      const { rowCount } = await pool.query('DELETE FROM products WHERE id=$1', [id]);
      if (rowCount === 0) return res.status(404).json({ error: 'Product not found' });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
