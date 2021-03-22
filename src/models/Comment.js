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
    }
    ,
    content: {
        type: String,
        required: true
    }
}, { timestamps: true })

const Comment = mongoose.model('Comment', commentSchema);
module.exports = { Comment, commentSchema }