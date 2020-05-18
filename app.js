const express = require('express');
const handlebars = require('express-handlebars');
const session = require('express-session');
const parser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const compression = require('compression');
const flash = require('express-flash');
const http = require('http');
const mongoose = require('mongoose');
const createError = require('http-errors');
const passport = require('passport');

const app = express();

mongoose.connect('mongodb://localhost/web', { useNewUrlParser : true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {
    console.log('database connection has been established');
});

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', handlebars( { helpers : require('./public/javascripts/helpers') } ));
app.set('view engine', 'handlebars');

app.use(compression());
app.use(flash());
app.use(parser.urlencoded( { extended : true } ));
app.use(parser.json());
app.use(express.json());
app.use(express.urlencoded( { extended : true } ));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session( { secret : 'secret', cookie : { maxAge : 86400000 }, resave : true, saveUninitialized : true } ));
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

app.use('/', require('./routes/main'));
app.use('/account', require('./routes/account'));

app.use((req, res, next) => {
    next();
});

http.createServer(app).listen(3000, () => {
    console.log('Application is now active');
});

module.exports = app;