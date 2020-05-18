const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    password : {
        type : String,
        required : true
    },

    uuid : {
        type : String,
        required : true
    },

    username : {
        type : String,
        required : true
    },

    created : {
        type : Number,
        required : true
    },

    email : {
        type : String,
        required : true
    },

    email_confirmed : {
        type : Boolean,
        required : true
    },

    discord_id : {
        type : String,
        required : false
    },

    youtube_channel : {
        type : String,
        required : false
    },

    twitch_channel : {
        type : String,
        required : false
    }
});

module.exports = mongoose.model('Account', AccountSchema);