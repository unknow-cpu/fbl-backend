const User = require('../models/userModel');

exports.register = async (req, res) => {
    try {
      const { firstName, lastName, day, month, year, gender, username, password } = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!username || !password || !firstName || !lastName || !day || !month || !year || !gender) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin'
        });
      }
  
      // Kiểm tra user tồn tại
      const existingUser = await User.findOne({ $or: [{ username }] });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Tài khoản đã tồn tại'
        });
      }
  
      const bornDay = `${day}/${month}/${year}`;
  
      const newUser = new User({ 
        firstName,
        lastName,
        bornDay,
        gender,
        username,
        password, // Sẽ được hash tự động từ pre-save hook
      });
  
      await newUser.save();
      
      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        redirect: '/login' // Client sẽ xử lý redirect
      });
  
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi đăng ký'
      });
    }
  };


// Cập nhật phương thức login
exports.login = async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Tìm kiếm user với username và kèm theo trường password
      const user = await User.findOne({ username }).select('+password');
      
      if (!user || !(await user.comparePassword(password))) {
        return res.status(400).json({
          success: false,
          message: 'Thông tin đăng nhập không chính xác'
        });
      }
  
      // Tạo session cho user
      req.session.user = {
        id: user._id,
        name: user.firstName + ' ' + user.lastName,
        role: user.role,
        avate: user.avata,
        cover: user.cover,
      };
  
      // Redirect dựa trên role của user
      res.status(200).json({
        success: true,
        redirect: user.role === 'admin' ? '/admin/dashboard' : '/home'
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi đăng nhập, vui lòng thử lại sau'
      });
    }
  };

exports.checksession = (req, res) => {
    res.json({
        isAuthenticated: !!req.session.user,
        user: req.session.user || null
      });
}

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
          return res.status(500).json({ 
            success: false,
            message: 'Lỗi server khi đăng xuất' 
          });
        }
        
        res.clearCookie('connect.sid', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
          });

        res.json({ 
          success: true,
          message: 'Đăng xuất thành công' 
        });
      });

      const checkAuth = (req, res, next) => {
        if (!req.session.user) {
          return res.status(401).json({ 
            error: 'Phiên làm việc đã hết hạn' 
          });
        }
        next();
      };
  };

  exports.getuserbyid= (req, res) => {
    
  }
  
  exports.getalluserid= (req, res) => {
    
  }