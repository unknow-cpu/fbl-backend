const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'họ là bắt buộc'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Tên là bắt buộc'],
    trim: true
  },
  username: {
    type: String,
    required: [true, 'Username là bắt buộc'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu tối thiểu 6 ký tự']
  },
  email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
          validator: function(v) {
            const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
            return emailRegex.test(v);
          },
          message: props => `${props.value} không phải là email hợp lệ!`
        }
      
  },
  role: {
    type: String,
    enum: ['memberUser', 'admin'],
    default: 'memberUser'
  },
  gender: {
    type: String,
    enum: ['Nữ', 'Nam', 'Tùy Chỉnh']
  },
  address: {
    type: String,
    default:''
  },
  bornDay: {
    type: String,
  },
  phoneNumber: {
    type: String,
    trim: true,
    validate: {
        validator: function(v) {
            const phoneRegex = /^\d{10,11}$/;
            return phoneRegex.test(v);
        },
        message: props => `${props.value} không phải là email hợp lệ!`
    }
  },
  avata: {
    type: String,
    default:''
  },
  cover: {
    type: String,
    default:''
  },
  listfriendid: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], // Changed to ObjectId references
    default: [],
  },
  listaddfriendid: { // Friend requests sent
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    default: [],
  },
  listacceptfriendid: { // Friend requests received
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    default: [],
  },
}, { timestamps: true });

// Hash password trước khi lưu
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Phương thức so sánh password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('user', userSchema);