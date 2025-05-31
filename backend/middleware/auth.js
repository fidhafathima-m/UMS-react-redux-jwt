import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('No token');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) throw new Error('User not found');
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Error: Token is not valid' });
  }
};

const adminAuth = (req, res, next) => {
    if(req.user.role !== 'admin') {
        return res.status(403).json({message: 'Admin access denied'})
    }
    next();
}
export {auth, adminAuth};