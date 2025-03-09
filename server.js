require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
// Khởi tạo ứng dụng Express
const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(limiter);

// Middleware
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    httpOnly: true,
    sameSite: 'strict',
    cookie: { secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 ngày 
      }
  }));


// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));


// Import các route
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

app.use(express.json());
app.use('/uploads', express.static('uploads'));
require('./models/userModel');
require('./models/postModel');
// Sử dụng route
app.use('/api', userRoutes);
app.use('/api', authRoutes);
app.use('/api', postRoutes);
// app.post('/login', cors(), (req, res) => {
//   res.send('Login successful');
// });



app.get('/', (req, res) => {
    res.send('Welcome to the eCommerce API');
  });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});


// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
