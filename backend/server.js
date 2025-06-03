import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import multer from 'multer'
import path from 'path'
import User from './models/User.js'
import { adminAuth, auth } from './middleware/auth.js'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url';
import fs from 'fs';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

mongoose.connect(process.env.MONGO_URI)

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});


const storage = multer.diskStorage({
    destination: function(res, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if(file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Only image files are allowed'))
        }
    }
})

app.post('/api/auth/register', async(req, res) => {
    try {
        const {name, email, password} = req.body;
        let user = await User.findOne({email})
        if(user) {
            return res.status(400).json({message: 'User already exists'})
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        

        const defaultProfile = '/uploads/profile_default.jpg'

        user = new User({
            name, email, password: hashedPassword, role: 'user', profileImage: defaultProfile
        })
        await user.save()

        // Generate JWT
        const payLoad = {
            id: user.id, role: user.role
        }
        const token = jwt.sign(payLoad, process.env.JWT_SECRET, {expiresIn: '24h'})
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage
            }
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({message: 'Server Error'})
    }
})

app.post('/api/auth/login', async(req, res) => {
    try {
        const { email, password} = req.body;
        let user = await User.findOne({email})
        if(!user) {
            return res.status(400).json({message: 'User not found | Might be deleted by Admin'})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) {
            return res.status(400).json({message: 'Invalid credentials'})
        }
        const payLoad = {
            id: user.id, role: user.role
        }
        const token = jwt.sign(payLoad, process.env.JWT_SECRET, {expiresIn: '24h'})

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage
            }
        })


    } catch (error) {
        console.error(error)
        res.status(500).json({message: 'Server Error'})
    }
})

app.get('/api/auth/me', auth, async(req, res) => {
  try {
    res.json({ 
      user: req.user 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/api/users', auth, adminAuth, async(req, res) => {
    try {
        const users = await User.find().select('-password')
        res.json(users);
    } catch (error) {
        return res.status(500).json({message: 'Server Error'})
    }
})

app.get('/api/users/search', auth, adminAuth, async(req, res) => {
  try {
    const { q } = req.query;  
    const { page = 1, limit = 10 } = req.query;
    
    const users = await User.find({
      $or: [
        {name: {$regex: q, $options: 'i'}},
        {email: {$regex: q, $options: 'i'}},
      ]
    })
    .select('-password')
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    const count = await User.countDocuments({
      $or: [
        {name: {$regex: q, $options: 'i'}},
        {email: {$regex: q, $options: 'i'}},
      ]
    });
    
    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Server Error'});
  }
})

app.get('/api/users/:id', auth, async(req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password')
        if(!user) {
            return res.status(404).json({message: 'User not found'})
        }
        res.json(user);
    } catch (error) {
        return res.status(500).json({message: 'Server Error'})
    }
})

app.put('/api/users/profile', auth, upload.single('profileImage'), async (req, res) => {
    try {
        const { name, email } = req.body;
        const updateData = { name, email };

        if (req.file) {
            updateData.profileImage = `/uploads/${req.file.filename}`;
            
            if (req.user.profileImage) {
                const oldImagePath = path.join(__dirname, '..', req.user.profileImage);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        if (email && email !== req.user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ 
            user: {
                ...user._doc,
                profileImage: user.profileImage || null
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
app.post('/api/users', auth, adminAuth, async(req, res) => {
    try {
        const {name, email, role} = req.body
        let user = await User.findOne({email})
        if(user) {
            return res.status(400).json({message: 'User already exists with that email'})
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash('password123', salt)

        const defaultProfile = '/uploads/profile_default.jpg'

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
            profileImage: defaultProfile
        })

        await user.save()
            
        const userResponse = await User.findById(user.id).select('-password')
        res.json(userResponse)
    } catch (error) {
        return res.status(500).json({message: 'Server Error'})
    }
})

app.put('/api/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, role } = req.body
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.delete('/api/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})