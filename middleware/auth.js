import admin from 'firebase-admin';

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;

        // Check if user is admin
        if (decodedToken.admin !== true) {
            return res.status(403).json({ message: 'Forbidden: Admins only' });
        }

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export default auth;
