const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true
    },

    uuid : {
        type : String,
        required : true
    },

    type : {
        type : String,
        required : true
    },

    expire : {
        type : Number,
        required : true
    }
});

module.exports = mongoose.model('Session', SessionSchema);