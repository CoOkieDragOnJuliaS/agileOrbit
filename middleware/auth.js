import admin from 'firebase-admin';

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export default auth;
