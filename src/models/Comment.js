const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
    },
    userName: {
        type: String
    },
    rate: {
        type: Number
    }
    ,
    content: {
        type: String
    }
}, { timestamps: true })

const Comment = mongoose.model('Comment', commentSchema);
module.exports = { Comment, commentSchema }