// api/config.js
export default function handler(req, res) {
  const config = process.env.FIREBASE_CONFIG;
  if (!config) {
    return res.status(500).json({ error: 'Missing Firebase configuration' });
  }
  try {
    const parsed = JSON.parse(config);
    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: 'Invalid JSON in FIREBASE_CONFIG' });
  }
}
