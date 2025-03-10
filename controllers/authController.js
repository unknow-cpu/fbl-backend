const User = require('../models/userModel');

  const jwt = require('jsonwebtoken'); // Add jsonwebtoken for token-based auth
  require('dotenv').config(); // For accessing environment variables
  
  // Register a new user
  exports.register = async (req, res) => {
    try {
      const { firstName, lastName, day, month, year, gender, username, password } = req.body;
  
      // Validate input
      if (!username || !password || !firstName || !lastName || !day || !month || !year || !gender) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin',
        });
      }
  
      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Tài khoản đã tồn tại',
        });
      }
  
      const bornDay = `${day}/${month}/${year}`;
  
      const newUser = new User({
        firstName,
        lastName,
        bornDay,
        gender,
        username,
        password, // Will be hashed by pre-save hook
      });
  
      await newUser.save();
  
      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        redirect: '/login',
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi đăng ký',
      });
    }
  };
  
  // Login user and return a JWT token
  exports.login = async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Find user and include password field
      const user = await User.findOne({ username }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(400).json({
          success: false,
          message: 'Thông tin đăng nhập không chính xác',
        });
      }
  
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'your_jwt_secret', // Use environment variable
        { expiresIn: '1d' } // Token expires in 1 day
      );
  
      res.status(200).json({
        success: true,
        token, // Send token to client
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          avatar: user.avatar, // Corrected typo from 'avate'
          cover: user.cover,
        },
        redirect: user.role === 'admin' ? '/admin/dashboard' : '/home',
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi đăng nhập, vui lòng thử lại sau',
      });
    }
  };
  
  // Check session (validate JWT token)
  exports.checkSession = async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer <token>"
      if (!token) {
        return res.json({
          isAuthenticated: false,
          user: null,
        });
      }
  
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      const user = await User.findById(decoded.id).select('-password'); // Exclude password
  
      if (!user) {
        return res.json({
          isAuthenticated: false,
          user: null,
        });
      }
  
      res.json({
        isAuthenticated: true,
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          avatar: user.avatar,
          cover: user.cover,
        },
      });
    } catch (error) {
      console.error('Check session error:', error);
      res.json({
        isAuthenticated: false,
        user: null,
      });
    }
  };
  
  // Logout (client-side token removal, no server session to destroy)
  exports.logout = async (req, res) => {
    try {
      res.json({
        success: true,
        message: 'Đăng xuất thành công',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi đăng xuất',
      });
    }
  };
  
  // Middleware to protect routes
  exports.protect = async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]; // Extract token
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Không có quyền truy cập, vui lòng đăng nhập',
        });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      const user = await User.findById(decoded.id);
  
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Người dùng không tồn tại',
        });
      }
  
      req.user = user; // Attach user to request object
      next();
    } catch (error) {
      console.error('Protect middleware error:', error);
      res.status(401).json({
        success: false,
        message: 'Phiên làm việc không hợp lệ hoặc đã hết hạn',
      });
    }
  };