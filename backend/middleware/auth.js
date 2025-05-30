import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET

const auth = async(req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '')

        if(!token) {
            return res.status(401).json({message: 'No token, authorization failed'})
        }

        const decoded = jwt.verify(token, JWT_SECRET)
        const user = await User.findById(decoded.id).select('-password')

        if(!user) {
            return res.status(401).json({message: 'Token is not valid'})
        }
        req.user = user
        next();
    } catch (error) {
        res.status(401).json({message: 'Error: Token is not valid'})
    }
}

const adminAuth = (req, res, next) => {
    if(req.user.role !== 'admin') {
        return res.status(403).json({message: 'Admin access denied'})
    }
    next();
}
export {auth, adminAuth};