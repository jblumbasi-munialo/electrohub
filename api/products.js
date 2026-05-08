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
        images JSONB DEFAULT '[]',
        icon TEXT DEFAULT 'fa-box',
        rating REAL DEFAULT 4.5,
        supplier TEXT DEFAULT '',
        description TEXT DEFAULT ''
      );
    `);

    const { rows: countRows } = await pool.query('SELECT COUNT(*)::int AS count FROM products');
    if (countRows[0].count === 0) {
      const defaultProducts = [
        {
          name: 'iPhone 15 Pro Max', category: 'Smartphone', priceKES: 179999,
          image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80',
          images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80', 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400&q=80'],
          icon: 'fa-mobile-alt', rating: 4.8, description: 'Apple flagship with A17 Pro chip, 48MP camera, and titanium design.'
        },
        {
          name: 'Samsung Galaxy S24 Ultra', category: 'Smartphone', priceKES: 164999,
          image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80',
          images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80', 'https://images.unsplash.com/photo-1598327105854-c8674f2d2e29?w=400&q=80'],
          icon: 'fa-mobile-alt', rating: 4.7, description: '200MP camera, S Pen, and powerful Snapdragon 8 Gen 3.'
        },
        {
          name: 'MacBook Air M3', category: 'Laptop', priceKES: 194999,
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
          images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&q=80'],
          icon: 'fa-laptop', rating: 4.9, description: 'Lightweight laptop with M3 chip, 15.3" Liquid Retina display, 8GB RAM.'
        },
        {
          name: 'Dell XPS 15', category: 'Laptop', priceKES: 224999,
          image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&q=80',
          images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&q=80', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80'],
          icon: 'fa-laptop', rating: 4.6, description: 'Premium Windows laptop with 13th Gen Intel i7, 16GB RAM, 512GB SSD.'
        },
        {
          name: 'Sony WH-1000XM5', category: 'Headphone', priceKES: 52499,
          image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80',
          images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80', 'https://images.unsplash.com/photo-1577174881658-0f30ed549ad0?w=400&q=80'],
          icon: 'fa-headphones', rating: 4.7, description: 'Industry-leading noise cancelling with 30-hour battery life.'
        },
        {
          name: 'AirPods Pro 2', category: 'Headphone', priceKES: 37499,
          image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&q=80',
          images: ['https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&q=80', 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400&q=80'],
          icon: 'fa-headphones', rating: 4.8, description: 'Apple 2nd gen Pro with adaptive audio and USB‑C charging.'
        },
        {
          name: 'iPad Pro 12.9', category: 'Tablet', priceKES: 164999,
          image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80',
          images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80', 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb2?w=400&q=80'],
          icon: 'fa-tablet-alt', rating: 4.9, description: 'M2 chip, Liquid Retina XDR display, perfect for creatives.'
        },
        {
          name: 'Samsung Galaxy Tab S9', category: 'Tablet', priceKES: 134999,
          image: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb2?w=400&q=80',
          images: ['https://images.unsplash.com/photo-1585790050230-5dd28404ccb2?w=400&q=80', 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&q=80'],
          icon: 'fa-tablet-alt', rating: 4.5, description: 'Snapdragon 8 Gen 2, 120Hz AMOLED, S Pen included.'
        },
        {
          name: 'Canon EOS R6', category: 'Camera', priceKES: 374999,
          image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80',
          images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80'],
          icon: 'fa-camera', rating: 4.8, description: 'Full‑frame mirrorless with 20MP, 4K 60p video, and IBIS.'
        },
        {
          name: 'GoPro Hero 12', category: 'Camera', priceKES: 59999,
          image: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400&q=80',
          images: ['https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400&q=80', 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=400&q=80'],
          icon: 'fa-camera', rating: 4.6, description: 'Waterproof action cam with 5.3K video and HyperSmooth 6.0.'
        },
        {
          name: 'USB-C Hub 7-in-1', category: 'Accessory', priceKES: 7349,
          image: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400&q=80',
          images: ['https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400&q=80', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80'],
          icon: 'fa-plug', rating: 4.4, description: 'Compact hub with HDMI, USB‑A, USB‑C, SD card reader.'
        },
        {
          name: 'Wireless Charger Pad', category: 'Accessory', priceKES: 4349,
          image: 'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=400&q=80',
          images: ['https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=400&q=80', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&q=80'],
          icon: 'fa-charging-station', rating: 4.3, description: 'Fast wireless charger compatible with iPhone and Android.'
        },
        {
          name: 'Realme C55 4GB/64GB', category: 'Smartphone', priceKES: 15999,
          image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80',
          images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80', 'https://images.unsplash.com/photo-1598327105668-5b89351aff97?w=400&q=80'],
          icon: 'fa-mobile-alt', rating: 4.2, supplier: 'Alibaba ID 123456', description: 'Budget smartphone with 64GB storage, 5000mAh battery.'
        },
        {
          name: 'JBL Flip 6', category: 'Accessory', priceKES: 12499,
          image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80',
          images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80', 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400&q=80'],
          icon: 'fa-speaker', rating: 4.6, description: 'Portable waterproof Bluetooth speaker with deep bass.'
        }
      ];
      for (const p of defaultProducts) {
        await pool.query(
          `INSERT INTO products (name, category, "priceKES", image, images, icon, rating, supplier, description)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [p.name, p.category, p.priceKES, p.image, JSON.stringify(p.images), p.icon, p.rating, p.supplier||'', p.description||'']
        );
      }
    }

    // GET – return all products
    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM products ORDER BY id');
      // Transform images from JSON string to array
      const rows = result.rows.map(row => ({
        ...row,
        images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : []
      }));
      return res.status(200).json(rows);
    }

    // POST – add product (admin only)
    if (req.method === 'POST') {
      const adminKey = req.headers['x-admin-key'];
      if (adminKey !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });

      const { name, category, priceKES, image, images, icon, rating, supplier, description } = req.body;
      if (!name || !category || !priceKES || !image) return res.status(400).json({ error: 'Missing required fields' });

      const imagesArr = images || [image];  // ensure main image is in the array
      const result = await pool.query(
        `INSERT INTO products (name, category, "priceKES", image, images, icon, rating, supplier, description)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [name, category, priceKES, image, JSON.stringify(imagesArr), icon||'fa-box', rating||4.5, supplier||'', description||'']
      );
      const row = result.rows[0];
      row.images = imagesArr;
      return res.status(201).json(row);
    }

    // PUT – update product
    if (req.method === 'PUT') {
      const adminKey = req.headers['x-admin-key'];
      if (adminKey !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
      const { id, name, category, priceKES, image, images, icon, rating, supplier, description } = req.body;
      if (!id) return res.status(400).json({ error: 'Product ID required' });

      const updates = [];
      const values = [];
      let idx = 1;
      for (const [key, val] of Object.entries({ name, category, priceKES, image, images, icon, rating, supplier, description })) {
        if (val !== undefined) {
          if (key === 'images') {
            updates.push(`"images" = $${idx}`);
            values.push(JSON.stringify(val));
          } else {
            updates.push(`"${key}" = $${idx}`);
            values.push(val);
          }
          idx++;
        }
      }
      if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
      values.push(id);
      const query = `UPDATE products SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`;
      const result = await pool.query(query, values);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
      const row = result.rows[0];
      row.images = row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : [];
      return res.status(200).json(row);
    }

    // DELETE – remove product
    if (req.method === 'DELETE') {
      const adminKey = req.headers['x-admin-key'];
      if (adminKey !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Product ID required' });
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
