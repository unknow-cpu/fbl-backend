const User = require('../models/userModel');
const Post = require('../models/postModel');
const mongoose = require('mongoose');



  
  // Get user by ID
  exports.getUserById = async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng',
        });
      }
  
      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          avatar: user.avatar,
          cover: user.cover,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy thông tin người dùng',
      });
    }
  };
  
  // Get all users (e.g., for admin purposes)
  exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find().select('-password');
      res.status(200).json({
        success: true,
        users: users.map((user) => ({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          avatar: user.avatar,
          cover: user.cover,
          role: user.role,
        })),
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách người dùng',
      });
    }
  };

  exports.getUserProfile = async (req, res) => {
    try {
      const userId = req.params.userId;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ status: 'fail', message: 'Invalid user ID' });
      }
  
      const user = await User.findById(userId)
        .select('-password')
        .populate('listfriendid', 'firstName lastName avatar')
        .populate('listacceptfriendid', 'firstName lastName avatar');
      if (!user) {
        return res.status(404).json({ status: 'fail', message: 'User not found' });
      }
  
      const posts = await Post.find({ userpostid: userId })
        .populate('userpostid', 'firstName lastName avatar')
        .populate('postcommen.user', 'firstName lastName avatar')
        .sort('-createdAt');
  
      const currentUserId = req.user?._id || null;
      res.status(200).json({
        status: 'success',
        data: {
          user,
          posts,
          isOwnProfile: currentUserId?.toString() === userId.toString(),
          isFriend: currentUserId && user.listfriendid.some(f => f._id.toString() === currentUserId.toString()),
          hasSentRequest: currentUserId && user.listacceptfriendid.includes(currentUserId),
          hasReceivedRequest: currentUserId && user.listaddfriendid.includes(currentUserId),
        },
      });
    } catch (err) {
      console.error('Get user profile error:', err.stack);
      res.status(500).json({ status: 'fail', message: err.message });
    }
  };
  
  exports.addFriend = async (req, res) => {
    try {
      const friendId = req.params.friendId;
      const currentUserId = req.user._id;
  
      if (friendId === currentUserId.toString()) {
        return res.status(400).json({ status: 'fail', message: 'Không thể thêm chính mình' });
      }
  
      const currentUser = await User.findById(currentUserId);
      const friend = await User.findById(friendId);
  
      if (currentUser.listfriendid.includes(friendId)) {
        return res.status(400).json({ status: 'fail', message: 'Đã là bạn bè' });
      }
  
      if (currentUser.listaddfriendid.includes(friendId)) {
        return res.status(400).json({ status: 'fail', message: 'Đã gửi yêu cầu kết bạn' });
      }
  
      // Add to sender's sent requests and receiver's received requests
      await User.findByIdAndUpdate(currentUserId, { $addToSet: { listaddfriendid: friendId } });
      await User.findByIdAndUpdate(friendId, { $addToSet: { listacceptfriendid: currentUserId } });
  
      res.status(200).json({ status: 'success', message: 'Đã gửi yêu cầu kết bạn' });
    } catch (err) {
      res.status(500).json({ status: 'fail', message: err.message });
    }
  };

  // Accept a received friend request
exports.acceptFriendRequest = async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const currentUserId = req.user._id;

    if (friendId === currentUserId.toString()) {
      return res.status(400).json({ status: 'fail', message: 'Không thể chấp nhận chính mình' });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser.listacceptfriendid.includes(friendId)) {
      return res.status(400).json({ status: 'fail', message: 'Không có yêu cầu kết bạn để chấp nhận' });
    }

    // Add to both users' friend lists and remove from request lists
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { listfriendid: friendId },
      $pull: { listacceptfriendid: friendId },
    });
    await User.findByIdAndUpdate(friendId, {
      $addToSet: { listfriendid: currentUserId },
      $pull: { listaddfriendid: currentUserId },
    });

    res.status(200).json({ status: 'success', message: 'Đã chấp nhận kết bạn' });
  } catch (err) {
    console.error('Accept friend request error:', err.stack);
    res.status(500).json({ status: 'fail', message: err.message });
  }
};


// Cancel a sent friend request
exports.cancelFriendRequest = async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const currentUserId = req.user._id;

    if (friendId === currentUserId.toString()) {
      return res.status(400).json({ status: 'fail', message: 'Không thể hủy yêu cầu với chính mình' });
    }

    const currentUser = await User.findById(currentUserId);
    const friend = await User.findById(friendId);

    if (!currentUser.listaddfriendid.includes(friendId)) {
      return res.status(400).json({ status: 'fail', message: 'Chưa gửi yêu cầu kết bạn' });
    }

    // Remove from sender's sent requests and receiver's received requests
    await User.findByIdAndUpdate(currentUserId, { $pull: { listaddfriendid: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { listacceptfriendid: currentUserId } });

    res.status(200).json({ status: 'success', message: 'Đã hủy yêu cầu kết bạn' });
  } catch (err) {
    console.error('Cancel friend request error:', err.stack);
    res.status(500).json({ status: 'fail', message: err.message });
  }
};