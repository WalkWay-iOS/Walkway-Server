const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { commentSchema } = require('./Comment');

const recordSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
    },
    distance: {
        type: Number,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    rate: {
        type: Number,
        required: true
    },
    comment: { 
        type: commentSchema,
        required: true
    }
}, { timestamps: true })

const Record = mongoose.model('Record', recordSchema);
module.exports = { Record }