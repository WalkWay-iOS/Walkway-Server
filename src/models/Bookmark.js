const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookmarkSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }
}, { timestamps: true })

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
module.exports = { Bookmark }