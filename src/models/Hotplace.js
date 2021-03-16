const mongoose = require('mongoose');

const hotplaceSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    position: [ Number ]
}, { versionKey: false })

const Hotplace = mongoose.model('Hotplace', hotplaceSchema);
module.exports = { Hotplace }