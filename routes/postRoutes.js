const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authController = require('../controllers/userController');

// Create a new post (requires authentication)
router.post('/posts', authController.protect, postController.post);

// Load all posts (no authentication required, adjust if needed)
router.get('/posts', postController.loadpost);

// Like a post (requires authentication)
router.patch('/posts/like/:id', authController.protect, postController.likepost);

// Comment on a post (requires authentication)
router.patch('/posts/comment/:id', authController.protect, postController.commenpost);

// Share a post (requires authentication)
router.patch('/posts/share/:id', authController.protect, postController.sharepost);


module.exports = router;