const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const Account = require('../models/account')

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField : 'email', passwordField : 'password' }, function(username, password, done) {
            Account.findOne({ email : username}, function(err, user) {
                if (err) {
                    return done(err);
                }

                if (!user) {
                    return done(null, false);
                }

                bcrypt.compare(password, user.password, (err, match) => {
                    if (err) {
                        return done(err);
                    }

                    if (match) {
                        return done(null, user);
                    }

                    return done(null, false);
                });
            });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        Account.findById(id, function(err, user) {
            done(err, user);
        });
    });
};