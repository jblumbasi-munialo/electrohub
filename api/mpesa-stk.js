// api/mpesa-stk.js
const fetch = require('node-fetch');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, amount } = req.body;
  if (!phone || !amount) return res.status(400).json({ error: 'Missing phone or amount' });

  const apiKey = process.env.INTASEND_SECRET_KEY || process.env.MPESA_SECRET_KEY || process.env.MPESA_CONSUMER_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'M-Pesa / IntaSend secret key not configured. Add INTASEND_SECRET_KEY or MPESA_SECRET_KEY to your Vercel environment.'
    });
  }

  try {
    const response = await fetch('https://sandbox.intasend.com/api/v1/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        currency: 'KES',
        amount: amount,
        phone_number: phone,
        email: 'customer@example.com',
        payment_method: 'MPESA',
        comment: 'ElectroHub order',
      }),
    });

    const data = await response.json();
    return res.status(response.ok ? 200 : 500).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
