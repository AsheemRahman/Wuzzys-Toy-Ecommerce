const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    title:{
        type : String,
        required: true,
    },
    content:{
        type : String,
        required: true,
    },
    startDate: {
        type : Date,
        required: true,
    },
    endDate: {
        type : Date,
        required: true,
    },
    Image : {
        type: String,
    }
},{ timestamps:true });

module.exports = mongoose.model('Popup', schema);


