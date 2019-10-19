const axios = require('axios');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const utils = require('./../utils');
const querystring = require('querystring');
const tmp = require('tmp-promise');

/**
 * Middleware to process multipart form-data with multer
 * @param {*} req request
 * @param {*} res response
 * @param {*} next callback function
 */
const processFormData = function(req, res, next) {
  tmp
    .dir()
    .then(tmpDir => {
      const config = {
        dest: tmpDir.path,
        limits: { fileSize: 2 * 1000 * 1000 },
      };

      const saveImage = multer(config).single('image');
      saveImage(req, res, err => {
        next(err);
      });
    })
    .catch(err => {
      next(err);
    });
};

/**
 * Handles GET requests for /
 */
router.get('/', function(req, res) {
  res.render('index', {
    fullname: '',
    city: '',
    markdown_de: '',
    markdown_en: '',
  });
});

/**
 * Handles POST requests for /
 */
router.post('/', processFormData, function(req, res, next) {
  if (!req.body) {
    return next('No data was submitted.');
  }

  if (
    req.body.fullname.trim().length === 0 ||
    req.body.city.trim().length === 0 ||
    req.body.markdown_de.trim().length === 0 ||
    req.body.markdown_en.trim().length === 0
  ) {
    return next('Please fill out all required fields.');
  }

  const captchaPromise = process.env.NODE_ENV === 'production'
    ? axios.post('https://www.google.com/recaptcha/api/siteverify',
        querystring.stringify({
          secret: process.env.RECAPTCHA_SECRET,
          response: req.query['g-recaptcha-response'],
        })
      )
    : Promise.resolve();

  captchaPromise
    .then(() => {
      console.log(
        `Processing submission for ${req.body.fullname} from ${req.body.city}.`
      );

      utils
        .submitProfile(
          req.body.fullname,
          req.body.city,
          req.body.markdown_de,
          req.body.markdown_en,
          req.file
        )
        .then(pullrequestUrl => {
          console.log(
            `Successful processes submission for ${req.body.fullname} from ${req.body.city} to ${pullrequestUrl}.`
          );
          return res.render('index', {
            fullname: '',
            city: '',
            markdown_de: '',
            markdown_en: '',
            success: `Thanks for submitting your profile. You can view the pull request at `,
            url: pullrequestUrl,
          });
        })
        .catch(error => {
          return next(error);
        });
    })
    .catch(error => {
      return next(error);
    });
});

module.exports = router;
