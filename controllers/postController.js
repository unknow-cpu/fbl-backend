const Post = require('../models/postModel');

exports.post = async (req, res) => {
    try {
        const { posttext, postimage } = req.body;
        
        const newPost = await Post.create({
            userpostid: req.user.id, // Giả sử đã có middleware xác thực
            posttext,
            postimage: postimage || '',
            postlike: [],
            postcommen: [],
            postshare: []
        });

        res.status(201).json({
            status: 'success',
            data: {
                post: newPost
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Tải tất cả bài đăng
exports.loadpost = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('userpostid', 'username avatar') // Populate thông tin người đăng
            .populate('postcommen.user', 'username') // Populate thông tin người comment
            .sort('-createdAt'); // Sắp xếp mới nhất trước

        res.status(200).json({
            status: 'success',
            results: posts.length,
            data: {
                posts
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Like bài đăng
exports.likepost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            {
                $addToSet: { postlike: userId } // Tránh trùng lặp
            },
            { new: true } // Trả về document mới
        );

        res.status(200).json({
            status: 'success',
            data: {
                post: updatedPost
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Thêm bình luận
exports.commenpost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { text } = req.body;
        const userId = req.user.id;

        const newComment = {
            user: userId,
            text: text.trim()
        };

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            {
                $push: { postcommen: newComment }
            },
            { new: true }
        ).populate('postcommen.user', 'username avatar');

        res.status(200).json({
            status: 'success',
            data: {
                post: updatedPost
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};s