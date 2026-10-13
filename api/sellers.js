const { Pool } = require('pg');
const crypto = require('crypto');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = async function handler(req, res) {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL is not configured.' });
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sellers (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        business_name TEXT NOT NULL,
        store_name TEXT NOT NULL,
        owner_name TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        approved_at TIMESTAMP NULL,
        kyc_status TEXT DEFAULT 'not_started',
        access_token_hash TEXT
      );
    `);
    await pool.query('ALTER TABLE sellers ADD COLUMN IF NOT EXISTS access_token_hash TEXT');

    if (req.method === 'GET') {
          const sellerToken = req.headers['x-seller-token'];
          if (sellerToken) {
            const sellerTokenHash = crypto.createHash('sha256').update(sellerToken).digest('hex');
            const result = await pool.query(
              'SELECT id, store_name, status FROM sellers WHERE access_token_hash = $1',
              [sellerTokenHash]
            );
            return res.status(200).json(result.rows[0] || null);
          }

          if (!process.env.ADMIN_SECRET || req.headers['x-admin-key'] !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ error: 'Unauthorized admin access.' });
      }

      const { id, email, status } = req.query || {};
      if (id) {
        const result = await pool.query('SELECT * FROM sellers WHERE id = $1', [id]);
        return res.status(200).json(result.rows[0] || null);
      }

      if (email) {
        const result = await pool.query('SELECT * FROM sellers WHERE email = $1', [email]);
        return res.status(200).json(result.rows[0] || null);
      }

      if (status) {
        const result = await pool.query('SELECT * FROM sellers WHERE status = $1 ORDER BY id DESC', [status]);
        return res.status(200).json(result.rows);
      }

      const result = await pool.query('SELECT * FROM sellers ORDER BY id DESC');
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const { email, phone, businessName, storeName, ownerName } = req.body || {};
      if (!email || !phone || !businessName || !storeName || !ownerName) {
        return res.status(400).json({ error: 'Missing required seller fields.' });
      }

      const accessToken = crypto.randomBytes(32).toString('hex');
      const accessTokenHash = crypto.createHash('sha256').update(accessToken).digest('hex');
      const result = await pool.query(
        `INSERT INTO sellers (email, phone, business_name, store_name, owner_name, status, kyc_status, access_token_hash)
         VALUES ($1, $2, $3, $4, $5, 'pending', 'not_started', $6)
         RETURNING *`,
        [email, phone, businessName, storeName, ownerName, accessTokenHash]
      );

      const { access_token_hash, ...seller } = result.rows[0];
      return res.status(201).json({ ...seller, accessToken });
    }

    if (req.method === 'PUT') {
      const adminKey = req.headers['x-admin-key'];
      if (!process.env.ADMIN_SECRET || adminKey !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ error: 'Unauthorized admin access.' });
      }

      const { id, status, kycStatus } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Seller id is required.' });
      if (status && !['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid seller status.' });
      }

      const updates = [];
      const values = [];
      let index = 1;

      if (status) {
        updates.push(`status = $${index}`);
        values.push(status);
        updates.push(`approved_at = CASE WHEN $${index} = 'approved' THEN NOW() ELSE NULL END`);
        index++;
      }

      if (kycStatus) {
        updates.push(`kyc_status = $${index}`);
        values.push(kycStatus);
        index++;
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update.' });
      }

      values.push(id);
      const query = `UPDATE sellers SET ${updates.join(', ')} WHERE id = $${index} RETURNING *`;
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Seller not found.' });
      }

      return res.status(200).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    console.error('Sellers API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
