const createError = require('http-errors');
require('dotenv').config();
const express = require('express');
const csp = require('helmet-csp');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const { uuid } = require('uuidv4');
const utils = require('./utils');

const indexRouter = require('./routes/index');
const app = express();

app.locals.title = 'Submit your profile to Hackerinnen.space';
app.locals.env = process.env.NODE_ENV;
app.locals.recaptchaKey = process.env.RECAPTCHA_KEY;

(async () => {
  try {
    // clone hackerinnen repo into tmp folder
    await utils.cloneRepo();
    console.log('Cloning repo success');
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
})();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(function(req, res, next) {
  res.locals.nonce = uuid();
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  csp({
    directives: {
      scriptSrc: [
        "'self'",
        "'strict-dynamic'",
        (req, res) => `'nonce-${res.locals.nonce}'`,
      ],
      styleSrc: [
        "'self'",
        'https://www.hackerinnen.space',
        'https://hackerinnen.space',
        'https://cdn.jsdelivr.net',
        'https://maxcdn.bootstrapcdn.com',
      ],
    },
  })
);
app.use(
  sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true,
  })
);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.log(`Oh snap! The server responded with this error: ${err}`);
  if (req.body) {
    res.render('index', {
      fullname: req.body.fullname,
      city: req.body.city,
      email: req.body.email,
      markdown_de: req.body.markdown_de,
      markdown_en: req.body.markdown_en,
      error: `Oh snap! The server responded with this error: ${err}`,
    });
  } else {
    res.render('error', {
      message: `Oh snap! The server responded with this error: ${err}`,
      error:{
        status: '',
        stack: ''
      }
    })
  }
});

module.exports = app;
