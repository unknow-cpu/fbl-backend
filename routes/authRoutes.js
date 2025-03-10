const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

// app.get('/check-session', (req, res) => {
//     res.json({ isAuthenticated: !!req.session.user });
//   });

router.get('/check-session', authController.checkSession);

// Register
router.get('/register', (req, res) => res.render('user/register'));
router.post('/register', authController.register);

// Login
router.get('/login', (req, res) => res.render('user/login'));
router.post('/login', authController.login);

// Dashboard
router.get('/user/:id', authController.protect, userController.getUserById);
router.get('/users', authController.protect, userController.getAllUsers);

// Logout
router.post('/logout', authController.logout);

module.exports = router;