const mongoose = require('mongoose');

// const postSchema = new mongoose.Schema({
//     userpostid: {
//         type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến người dùng tạo bài viết
//         ref: 'User', 
//         required: true
//     },
//     posttext: {
//         type: String,
//         trim: true
//     },
//     postimage: {
//         type: String, // Lưu URL hình ảnh
//         default: ''
//     },
//     postlike: [{
//         type: mongoose.Schema.Types.ObjectId, // Mảng ID người dùng đã like
//         ref: 'User'
//     }],
//     postcommen: [{ // Mảng các bình luận
//         user: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User',
//             required: true
//         },
//         text: {
//             type: String,
//             required: true,
//             trim: true
//         },
//         createdAt: {
//             type: Date,
//             default: Date.now
//         }
//     }],
//     postshare: [{
//         type: mongoose.Schema.Types.ObjectId, // Mảng ID người dùng đã share
//         ref: 'User'
//     }]
// }, { 
//     timestamps: true // Tự động thêm createdAt và updatedAt
// });

const postSchema = new mongoose.Schema({
    userpostid: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    posttext: { type: String, required: true },
    postimage: { type: String, default: '' },
    postlike: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    postcommen: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }, 
      },
    ],
    postshare: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    createdAt: { type: Date, default: Date.now },
  });


module.exports = mongoose.model('post', postSchema);