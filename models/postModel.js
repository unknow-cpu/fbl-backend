const mongoose = require('mongoose');


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