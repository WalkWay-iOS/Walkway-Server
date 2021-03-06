const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { hashtagSchema } = require('./Hashtag');

const courseSchema = mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true,
        maxlength: 15
    },
    distance: {
        type: Number,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    rateAverage: {
        type: Number,
        default: 0
    },
    strengthAverage: {
        type: Number,
        default: 0
    },
    isSeoul: {
        type: Boolean,
        default: false
    },
    content: {
        type: String,
        maxlength: 1000
    },
    image: {
        type: String,
        default: null
    },
    official: {
        type: Number,
        default: 0
    },
    usesCount: {
        type: Number,
        default: 0
    },
    bookmarkCount: {
        type: Number,
        default: 0
    },
    hashtag: [ hashtagSchema ],
    position: [ [ Number, Number ] ],
    placeName: [ String ]
}, { timestamps: true })

courseSchema.index({ rateAverage: -1, usesCount: -1, createdAt: -1 });
courseSchema.index({ title: "text" });

const Course = mongoose.model('Course', courseSchema);
module.exports = { Course }