const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BookScheme = new Schema({
  title: {
    type: String,
    required: [true, 'Bu alan zorunlu'],
    // unique: true,
    maxlength: [20, 'En fazla 20 karakter olmalı'],
  },
  comments: [{ message: String }],
  category: {
    type: String,
    minlength: [2, 'En az 2 karakter olmalı'],
  },
  meta: {
    votes: Number,
    favs: Number,
  },
  published: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('book', BookScheme);
