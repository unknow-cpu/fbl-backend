const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const upload = require('../middlewares/upload');

// Middleware kiểm tra đăng nhập
//const requireLogin = userController.checkRole(['memberUser', 'admin']);

// Profile người dùng
// router.get('/user', requireLogin, async (req, res) => {
//     try {
//         const user = await User.findById(req.session.user.id)
//           .select('-password') // Loại bỏ trường mật khẩu
//           .lean();
//         res.json({ success: true, user });
//       } catch (error) {
//         res.status(500).json({ success: false, message: 'Lỗi server' });
//       }
// });

// router.get('/userbyid', requireLogin, async (req, res) => {
//   try {
//       const user = await User.findById(req.session.user.id)
//         .select('-password') // Loại bỏ trường mật khẩu
//         .lean();
//       res.json({ success: true, user });
//     } catch (error) {
//       res.status(500).json({ success: false, message: 'Lỗi server' });
//     }
// });

// // router.get('/getuserbyid', userController.getuserbyid);
// // router.get('/getalluserid', userController.getalluserid);

// // Cập nhật thông tin cá nhân
// router.put('/profile-update', requireLogin, async (req, res) => {
//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       req.session.user.id,
//       { $set: req.body },
//       { new: true }
//     );
//     res.redirect('/profile');
//   } catch (error) {
//     res.redirect('/profile?error=Cập nhật thất bại');
//   }
// });

router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
    try {
      const userId = req.body.userId; // Giả sử có userId được truyền trong body
      const avatarPath = req.file.path; // Lưu đường dẫn file avatar
  
      // Cập nhật avatar cho người dùng
      const user = await User.findByIdAndUpdate(userId, { avatar: avatarPath }, { new: true });
  
      if (!user) {
        return res.status(404).json({ message: 'Người dùng không tồn tại' });
      }
  
      res.json({
        message: 'Avatar uploaded successfully',
        user
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  router.post('/upload-cover', upload.single('cover'), async (req, res) => {
    try {
      const userId = req.body.userId; // Giả sử có userId được truyền trong body
      const coverPath = req.file.path; // Lưu đường dẫn file cover
  
      // Cập nhật avatar cho người dùng
      const user = await User.findByIdAndUpdate(userId, { cover: coverPath }, { new: true });
  
      if (!user) {
        return res.status(404).json({ message: 'Người dùng không tồn tại' });
      }
  
      res.json({
        message: 'cover uploaded successfully',
        user
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });  

  
  router.get('/users/:userId', authController.protect, userController.getUserProfile);
  router.post('/users/add-friend/:friendId', authController.protect, userController.addFriend);
  router.post('/users/cancel-friend/:friendId', authController.protect, userController.cancelFriendRequest);
  router.post('/users/accept-friend/:friendId', authController.protect, userController.acceptFriendRequest);

module.exports = router;