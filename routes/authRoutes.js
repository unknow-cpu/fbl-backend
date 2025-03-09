const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// app.get('/check-session', (req, res) => {
//     res.json({ isAuthenticated: !!req.session.user });
//   });

router.get('/check-session', userController.checkSession);

// Register
router.get('/register', (req, res) => res.render('user/register'));
router.post('/register', userController.register);

// Login
router.get('/login', (req, res) => res.render('user/login'));
router.post('/login', userController.login);

// Dashboard
router.get('/user/:id', userController.protect, userController.getUserById);
router.get('/users', userController.protect, userController.getAllUsers);

// Logout
router.post('/logout', userController.logout);

module.exports = router;