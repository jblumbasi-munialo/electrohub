const admin = require('firebase-admin');

function getAdmin() {
  if (!admin.apps.length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccount) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured');
    }
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(serviceAccount)) });
  }
  return admin;
}

function readBearerToken(req) {
  const authorization = req.headers?.authorization || '';
  const [scheme, token] = authorization.split(' ');
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}

module.exports = async function handler(req, res) {
  if (!['GET', 'POST', 'PUT'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = readBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const firebase = getAdmin();
    const decodedToken = await firebase.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const userRef = firebase.firestore().collection('users').doc(uid);
    const profileRef = firebase.firestore().collection('sellers').doc(uid);

    if (req.method === 'GET') {
      const profileSnap = await profileRef.get();
      const userSnap = await userRef.get();
      return res.status(200).json({
        uid,
        profile: profileSnap.data() || {},
        user: userSnap.data() || {}
      });
    }

    const body = req.body || {};
    const required = ['businessName', 'storeName', 'email', 'phone', 'country'];
    if (required.some(field => !String(body[field] || '').trim())) {
      return res.status(400).json({ error: 'Business name, store name, email, phone, and country are required' });
    }

    const profile = {
      businessName: body.businessName.trim(),
      storeName: body.storeName.trim(),
      email: body.email.trim(),
      phone: body.phone.trim(),
      country: body.country.trim(),
      description: String(body.description || '').trim(),
      status: body.status || 'pending',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    if (req.method === 'PUT') {
      const existingProfile = await profileRef.get();
      profile.createdAt = existingProfile.data()?.createdAt || profile.createdAt;
    }

    await profileRef.set(profile, { merge: true });
    await userRef.set({
      email: body.email.trim(),
      name: body.businessName.trim(),
      role: 'seller',
      sellerId: uid
    }, { merge: true });

    return res.status(200).json({ success: true, sellerId: uid, profile });
  } catch (error) {
    console.error('Seller profile API error:', error);
    return res.status(500).json({ error: error.message || 'Unable to load seller profile' });
  }
};
