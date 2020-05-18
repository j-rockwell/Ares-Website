const express = require('express');
const router = express.Router();

const utils = require('../public/javascripts/utils');

router.get('/', (req, res) => {
    if (req.user) {
        res.render('index', { user : utils.getUsersContext(req.user) });
        return;
    }

    res.render('index');
});

router.get('/store', (req, res) => {
    res.status(301).redirect("http://store.playares.com");
});

router.get('/discord', (req, res) => {
    res.status(301).redirect("https://discord.gg/gfNqEwG");
});

router.get('/forums', (req, res) => {
    res.status(301).redirect("https://reddit.com/r/Ares");
});

router.get('/getting-started', (req, res) => {
    res.render('getting-started', { user : utils.getUsersContext(req.user) });
});

router.get('/partner', (req, res) => {
    res.render('partners', { user : utils.getUsersContext(req.user) });
});

router.get('/staff', (req, res) => {
    res.render('coming-soon', { user : utils.getUsersContext(req.user) });
});

router.get('/appeal', (req, res) => {
    res.render('coming-soon', { user : utils.getUsersContext(req.user) });
});

router.get('/rules', (req, res) => {
    res.render('coming-soon', { user : utils.getUsersContext(req.user) });
});

router.get('/hiring', (req, res) => {
    res.render('coming-soon', { user : utils.getUsersContext(req.user) });
});

module.exports = router;