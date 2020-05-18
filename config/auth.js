module.exports = {
    ensureAuth : function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }

        req.flash('error', 'Please sign in to view this page');
        res.redirect('/account/login');
    },

    forwardAuth : function(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }

        res.redirect('/');
    }
};