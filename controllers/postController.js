// const Post = require('../models/postModel');

// Create a new post
// exports.post = async (req, res) => {
//   try {
//     const { posttext, postimage } = req.body;

//     // Validate required fields
//     if (!posttext) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'Nội dung bài đăng là bắt buộc',
//       });
//     }

//     const newPost = await Post.create({
//       userpostid: req.user._id, // Use _id from req.user
//       posttext,
//       postimage: postimage || '',
//       postlike: [],
//       postcommen: [],
//       postshare: [],
//     });

//     // Populate user info for the response
//     await newPost.populate('userpostid', 'username avatar');

//     res.status(201).json({
//       status: 'success',
//       data: {
//         post: newPost,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: err.message || 'Lỗi khi tạo bài đăng',
//     });
//   }
// };


const Post = require('../models/postModel');
const multer = require('multer');
const path = require('path');

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Save files to 'uploads/' folder
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });
  
//   const upload = multer({
//     storage,
//     fileFilter: (req, file, cb) => {
//       if (file.mimetype.startsWith('image/')) {
//         cb(null, true);
//       } else {
//         cb(new Error('Chỉ hỗ trợ file ảnh!'));
//       }
//     },
//     limits: { fileSize: 5 * 1024 * 1024 }, // Optional: Limit to 5MB
//   }).single('postimage'); // Expect 'postimage' key from frontend FormData'

  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, 'uploads/'),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) cb(null, true);
      else cb(new Error('Chỉ hỗ trợ file ảnh!'));
    },
  }).single('postimage');
  
  exports.post = async (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          status: 'fail',
          message: err.message || 'Lỗi khi tải lên hình ảnh',
        });
      }
  
      try {
        const { posttext } = req.body;
  
        if (!posttext) {
          return res.status(400).json({
            status: 'fail',
            message: 'Nội dung bài đăng là bắt buộc',
          });
        }
  
        const newPost = await Post.create({
          userpostid: req.user._id,
          posttext,
          postimage: req.file ? `/uploads/${req.file.filename}` : '',
          postlike: [],
          postcommen: [],
          postshare: [],
        });
  
        await newPost.populate('userpostid', 'firstName lastName avatar');
  
        res.status(201).json({
          status: 'success',
          data: {
            post: newPost,
          },
        });
      } catch (err) {
        console.error('Error creating post:', err.stack); // Log for debugging
        res.status(400).json({
          status: 'fail',
          message: err.message || 'Lỗi khi tạo bài đăng',
        });
      }
    });
  };

// Load all posts
exports.loadpost = async (req, res) => {
  try {
    console.log('Loading posts...');
    console.log('Post model:', Post);

    if (!Post) {
      throw new Error('Post model is not defined');
    }

    const posts = await Post.find()
      .populate('userpostid', 'firstName lastName avatar')
      .populate('postcommen.user', 'firstName lastName avatar')
      .sort('-createdAt');

    console.log('Posts fetched:', posts.length);

    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: {
        posts,
      },
    });
  } catch (err) {
    console.error('Error in loadpost:', err.stack);
    res.status(500).json({
      status: 'fail',
      message: err.message || 'Lỗi khi tải bài đăng',
    });
  }
};

// Like or unlike a post
exports.likepost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: 'fail',
        message: 'Bài đăng không tồn tại',
      });
    }

    const alreadyLiked = post.postlike.includes(userId);
    const updateQuery = alreadyLiked
      ? { $pull: { postlike: userId } }
      : { $addToSet: { postlike: userId } };

    const updatedPost = await Post.findByIdAndUpdate(postId, updateQuery, {
      new: true,
    })
      .populate('userpostid', 'firstName lastName avatar')
      .populate('postcommen.user', 'firstName lastName avatar');

    res.status(200).json({
      status: 'success',
      data: {
        post: updatedPost,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message || 'Lỗi khi thích bài đăng',
    });
  }
};

// exports.likepost = async (req, res) => {
//     try {
//       const postId = req.params.id;
//       const userId = req.user._id;
  
//       const post = await Post.findById(postId);
//       if (!post) {
//         return res.status(404).json({
//           status: 'fail',
//           message: 'Bài đăng không tồn tại',
//         });
//       }
  
//       // Correctly check if the user's ID is in the postlike array
//       const alreadyLiked = post.postlike.some((id) => id.equals(userId));
//       const updateQuery = alreadyLiked
//         ? { $pull: { postlike: userId } }
//         : { $addToSet: { postlike: userId } };
  
//       const updatedPost = await Post.findByIdAndUpdate(postId, updateQuery, {
//         new: true,
//       })
//         .populate('userpostid', 'firstName lastName avatar')
//         .populate('postcommen.user', 'firstName lastName avatar');
  
//       res.status(200).json({
//         status: 'success',
//         data: {
//           post: updatedPost,
//         },
//       });
//     } catch (err) {
//       res.status(400).json({
//         status: 'fail',
//         message: err.message || 'Lỗi khi thích bài đăng',
//       });
//     }
//   };

// Add a comment to a post
exports.commenpost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        status: 'fail',
        message: 'Nội dung bình luận không được để trống',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: 'fail',
        message: 'Bài đăng không tồn tại',
      });
    }

    const newComment = {
      user: userId,
      text: text.trim(),
    };

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $push: { postcommen: newComment } },
      { new: true }
    )
      .populate('userpostid', 'firstName lastName avatar')
      .populate('postcommen.user', 'firstName lastName avatar');

    res.status(200).json({
      status: 'success',
      data: {
        post: updatedPost,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message || 'Lỗi khi thêm bình luận',
    });
  }
};

// Share a post
exports.sharepost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: 'fail',
        message: 'Bài đăng không tồn tại',
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { postshare: userId } },
      { new: true }
    )
      .populate('userpostid', 'firstName lastName avatar')
      .populate('postcommen.user', 'firstName lastName avatar');

    res.status(200).json({
      status: 'success',
      data: {
        post: updatedPost,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message || 'Lỗi khi chia sẻ bài đăng',
    });
  }
};