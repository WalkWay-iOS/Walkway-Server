const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const followerSchema = mongoose.Schema({
    userTo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    userFrom: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    isFollowing: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const Follower = mongoose.model('Follower', followerSchema);
module.exports = { Follower }