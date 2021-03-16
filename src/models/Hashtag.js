const mongoose = require('mongoose');

const hashtagSchema = mongoose.Schema({
    keyword: {
        type: String,
        required: true
    },
    referCount: {
        type: Number,
        default: 0
    }
}, { versionKey: false })

const Hashtag = mongoose.model('Hashtag', hashtagSchema);
module.exports = { Hashtag, hashtagSchema }