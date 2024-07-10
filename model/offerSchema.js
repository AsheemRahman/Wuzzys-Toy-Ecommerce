const mongoose = require('mongoose')

const schema = new mongoose.Schema({

    discountPercent:{
        type: Number,
        required: true,
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'offerType',
        required: true,
    },
    offerType:{
        type: String,
        enum: ['product','collection'],
        required: true,
    },
    isActive:{
        type: Boolean,
        default: true,
    }

},{timestamps: true})

module.exports = mongoose.model('offer',schema)