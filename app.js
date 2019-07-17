const createError = require('http-errors');
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const utils = require('./utils');

const indexRouter = require('./routes/index');
const recaptchaKey = process.env.RECAPTCHA_KEY;
const title = 'Submit your profile to Hackerinnen.space';

const app = express();

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
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
  res.render('index', {
    title: title,
    fullname: req.body.fullname,
    city: req.body.city,
    markdown_de: req.body.markdown_de,
    markdown_en: req.body.markdown_en,
    recaptchaKey: recaptchaKey,
    error: `Oh snap! The server responded with this error: ${err}`,
  });
});

module.exports = app;
