const getUsersContext = (user) => {
    let context;

    if (user) {
        context = {
            _id : user._id,
            uuid : user.uuid,
            username : user.username,
            created : user.created,
            email : user.email,
            email_confirmed : user.email_confirmed,
            discord_id : user.discord_id,
            youtube_channel : user.youtube_channel,
            twitch_channel : user.twitch_channel
        };
    }

    return context;
}

module.exports = {
    getUsersContext : getUsersContext
}