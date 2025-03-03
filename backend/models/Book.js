const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  publishDate: { type: String, required: true }, 
  genre: { type: String, required: true }, 
  ratings: [
    {
      userId: { type: String, required: true },
      grade: { type: Number, required: true, min: 0, max: 5 } 
    }
  ],
  averageRating: { type: Number, default: 0 },
  imageUrl: { type: String, required: true },
  userId: { type: String, required: true }
 });

module.exports = mongoose.model('Book', bookSchema);