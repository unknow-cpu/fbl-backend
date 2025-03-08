const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/post', authController.protect, postController.post);
router.get('/losdpost', postController.loadpost);
router.get('/likepost/:id', postController.likepost);
router.patch('/commenpost/:id', authController.protect, postController.commenpost);
router.patch('/sharepost/:id', authController.protect, postController.sharepost);

module.exports = router;