// api/orders.js
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK (needs service account)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });

  const { orderId, type, status } = req.body;
  if (!orderId || !status) return res.status(400).json({ error: 'Missing orderId or status' });

  try {
    if (type === 'guest') {
      await db.collection('guestOrders').doc(orderId).update({ status });
    } else {
      // Assume user orders are in users/{userId}/orders/{orderId}
      const [userId] = orderId.split('-'); // you may need a better structure; this is placeholder
      await db.collection('users').doc(userId).collection('orders').doc(orderId).update({ status });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Order update error:', error);
    return res.status(500).json({ error: error.message });
  }
}
