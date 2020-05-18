const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const mailer = require('../mail/mailer');

const Session = require('../models/session');
const Account = require('../models/account');

const { forwardAuth, ensureAuth } = require('../config/auth');
const utils = require('../public/javascripts/utils');

router.get('/create/:id', (req, res) => {
    const id = req.params.id;
    const date = new Date();

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid session ID');
        res.redirect('/');
        return;
    }

    Session.findById({ _id : req.params.id }, (err, session) => {
        if (err) {
            throw err;
        }

        if (!session) {
            req.flash('error', 'Session not found');
            res.redirect('/');
            return;
        }

        if (session.expire <= date.getTime()) {
            req.flash('error', 'This session has expired. Type /account create in-game again to start a new one.');
            res.redirect('/');
            return;
        }

        const context = {
            _id : session._id,
            username : session.username,
            type : session.type,
            expire : session.expire
        };

        res.render('account-create', { session : context });
    });
});

router.get('/reset/:id', (req, res) => {
    const id = req.params.id;
    const date = new Date();

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid session ID');
        res.redirect('/');
        return;
    }

    if (req.user) {
        req.logOut;
        console.log('logged out ' + req.user.username + ' because they are attempting to reset an account');
    }

    Session.findById({ _id : req.params.id }, (err, session) => {
        if (err) {
            throw err;
        }

        if (!session) {
            req.flash('error', 'Session not found');
            res.redirect('/');
            return;
        }

        if (session.expire <= date.getTime()) {
            req.flash('error', 'This session has expired. Type /account create in-game again to start a new one.');
            res.redirect('/');
            return;
        }

        const context = {
            _id : session._id,
            username : session.username,
            type : session.type,
            expire : session.expire
        };

        Account.findOne({ username : session.username }, (err, account) => {
            if (err) {
                throw err;
            }

            if (!account) {
                req.flash('error', 'Account not found');
                res.redirect('/');
                return;
            }

            res.render('account-reset', { account : utils.getUsersContext(account), session : context });
        });
    });
});

router.get('/login', forwardAuth, (req, res) => {
    res.render('account-login');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user) => {
        if (err) {
            throw err;
        }

        if (!user) {
            req.flash('error', 'Email/Password does not match');
            res.redirect('/account/login');
            return;
        }

        req.logIn(user, function(err) {
            if (err) {
                throw err;
            }

            return res.redirect('/');
        });
    })(req, res, next);
});


router.post('/reset/:id', (req, res) => {
    const { password, password2 } = req.body;
    let errors = [];
    let error = '';

    if (password != password2) {
        errors.push('Passwords do not match');
    }

    if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (password.length > 32) {
        errors.push('Password must be less than 32 characters long');
    }

    if (errors.length > 0) {
        if (errors.length == 1) {
            error = errors.toString();
        } else {
            error = errors.join(' and ');
        }

        req.flash('error', error);
        res.redirect('/create/' + req.params.id);
        return;
    }

    Session.findById({ _id : req.params.id }, (err, session) => {
        if (err) {
            throw err;
        }

        if (!session) {
            req.flash('error', 'Session not found');
            res.redirect('/');
            return;
        }

        Account.findOne({ uuid : session.uuid }, (err, account) => {
            if (err) {
                throw err;
            }

            if (!account) {
                req.flash('error', 'Account not found');
                res.redirect('/');
                return;
            }

            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    throw err;
                }

                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) {
                        throw err;
                    }

                    account.password = hash;

                    account.save().then(() => {
                        Session.deleteOne({ _id : session._id }, (err, result) => {
                            if (err) {
                                throw err;
                            }

                            console.log('Deleted session: ' + session._id);
                        });

                        req.logIn(account, (err) => {
                            if (err) {
                                throw err;
                            }

                            req.flash('success', 'Your password has been updated');
                            res.redirect('/');
                        });
                    });
                });
            });
        });
    });
});

// passport.authenticate('local', { successRedirect : '/', failureRedirect : '/', failureFlash : true })
router.post('/create/:id', (req, res) => {
    const { email, password, password2 } = req.body;
    let errors = [];
    let error = '';

    if (password != password2) {
        errors.push('Passwords do not match');
    }

    if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (password.length > 32) {
        errors.push('Password must be less than 32 characters long');
    }

    if (errors.length > 0) {
        if (errors.length == 1) {
            error = errors.toString();
        } else {
            error = errors.join(' and ');
        }

        req.flash('error', error);
        res.redirect('/create/' + req.params.id);
        return;
    }

    Session.findById({ _id : req.params.id }, (err, session) => {
        if (err) {
            throw err;
        }

        if (!session) {
            req.flash('error', 'Session not found');
            res.redirect('/');
            return;
        }

        Account.findOne({ 'uuid' : session.uuid }, (err, account) => {
            if (err) {
                throw err;
            }

            if (account) {
                req.flash('error', 'An account already exists for this Minecraft account');
                res.redirect('/');
                return;
            }

            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    throw err;
                }

                bcrypt.hash(req.body.password, salt, (err, hash) => {
                    if (err) {
                        throw err;
                    }

                    const newAccount = new Account({ password : hash, uuid : session.uuid, username : session.username, created : Date.now(), email : email, email_confirmed : false });

                    newAccount.save().then(() => {
                        Session.deleteOne({ _id : session._id }, (err, result) => {
                            if (err) {
                                throw err;
                            }

                            console.log('Deleted session: ' + session._id);
                        });

                        mailer.sendEmail(email, 'Welcome to Ares', 'welcome', context = { id : newAccount._id, username : session.username });

                        req.logIn(newAccount, (err) => {
                            if (err) {
                                throw err;
                            }

                            req.flash('success', "We've sent a confirmation email to " + req.body.email + ". Head over there to confirm your account.");
                            return res.redirect('/');
                        });
                    });
                });
            });
        });
    });
});

router.get('/profile/:id', (req, res) => {
    const userId = req.params.id;

    Account.findById({ _id : userId }, (err, account) => {
        if (err) {
            throw err;
        }

        if (!account) {
            req.flash('error', 'Account not found');
            res.redirect('/');
            return;
        }

        const createDate = new Date(account.created).toDateString();
        const ownership = (req.user != null && account != null && req.user._id.equals(account._id));

        res.render('account-profile', { user : utils.getUsersContext(req.user), account : utils.getUsersContext(account), create_date : createDate, ownership : ownership });
    });
});

router.get('/edit', ensureAuth, (req, res) => {
    const user = req.user;

    res.render('account-profile-edit', { user : utils.getUsersContext(user) });
});

router.post('/edit', ensureAuth, (req, res) => {
    const user = req.user;
    const values = req.body;
    let errors = [];
    let error = '';

    if (values.discord && !values.discord.match(/^((.+?)#\d{4})/)) {
        errors.push('Invalid Discord tag');
    }

    if (values.youtube && (values.youtube.length < 3) || values.youtube.length > 32) {
        errors.push('Invalid YouTube channel link');
    }

    if (values.twitch && (values.twitch.length < 3) || values.twitch.length > 32) {
        errors.push('Invalid Twitch channel link');
    }

    if (errors.length > 0) {
        if (errors.length == 1) {
            error = errors[0];
        } else {
            error = errors.join(', ');
        }

        req.flash('error', error);
        res.redirect('/account/edit');
        return;
    }

    user.discord_id = values.discord;
    user.youtube_channel = values.youtube;
    user.twitch_channel = values.twitch;

    Account.findOne({ _id : user._id }, (err, account) => {
        if (err) {
            throw err;
        }

        account.discord_id = values.discord;
        account.youtube_channel = values.youtube;
        account.twitch_channel = values.twitch;

        account.save().then(() => {
            req.flash('success', 'Your profile has been updated');
            res.redirect('/account/edit');
        });
    });
});

router.post('/password/update', ensureAuth, (req, res) => {
    const values = req.body;

    if (values.newpassword != values.newpassword2) {
        req.flash('error', 'New passwords do not match');
        res.redirect('/account/edit');
        return;
    }

    if (values.newpassword.length < 6) {
        req.flash('error', 'Password must be at least 6 characters long');
        res.redirect('/account/edit');
        return;
    }

    if (values.newpassword.length > 32) {
        req.flash('error', 'Password must be less than 32 characters long');
        res.redirect('/account/edit');
        return;
    }

    bcrypt.compare(values.password, req.user.password, (err, match) => {
        if (err) {
            throw err;
        }

        if (!match) {
            req.flash('error', 'Current password was incorrect');
            res.redirect('/account/edit');
            return;
        }

        Account.findOne({ _id : req.user._id }, (err, account) => {
            if (err) {
                throw err;
            }

            if (!account) {
                req.flash('error', 'Failed to obtain your account');
                res.redirect('/');
                return;
            }

            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    throw err;
                }

                bcrypt.hash(values.newpassword, salt, (err, hash) => {
                    if (err) {
                        throw err;
                    }

                    account.password = hash;

                    account.save().then(() => {
                        req.flash('success', 'Your password has been updated');
                        res.redirect('/account/edit');
                    });
                });
            });
        });
    });
});

router.get('/confirm/:id', (req, res) => {
    const userId = req.params.id;

    Account.findOne({ _id : userId }, (err, account) => {
        if (err) {
            throw err;
        }

        if (!account) {
            req.flash('error', 'Account not found');
            res.redirect('/');
            return;
        }

        if (account.email_confirmed) {
            req.flash('info', 'This account has already been confirmed');
            res.redirect('/');
            return;
        }

        account.email_confirmed = true;

        account.save().then(() => {
            req.flash('success', 'Your email address has been confirmed');
            res.redirect('/');
        });
    });
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('info', 'You have been signed out');
    res.redirect('/');
});

module.exports = router;