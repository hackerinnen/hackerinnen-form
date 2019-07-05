const axios = require('axios');
const express = require('express');
const router = express.Router();
const utils = require('./../utils');
const querystring = require('querystring');

const title = 'Hackerinnen.space - submit your profile';
const recaptchaKey = process.env.RECAPTCHA_KEY;

router.get('/', function(req, res, next) {
  res.render('index', { title: title, recaptchaKey: recaptchaKey });
});

router.post('/', function(req, res) {
  if (
    !req.body ||
    Object.keys(req.body).length === 0 ||
    req.body.fullname.length === 0 ||
    req.body.city.length === 0 ||
    req.body.markdown_de.length === 0 ||
    req.body.markdown_en.length === 0
  ) {
    return res.render('index', {
      title: title,
      recaptchaKey: recaptchaKey,
      error: 'Please fill out all fields.',
    });
  }

  axios
    .post(
      'https://www.google.com/recaptcha/api/siteverify',
      querystring.stringify({
        secret: process.env.RECAPTCHA_SECRET,
        response: req.query['g-recaptcha-response'],
      })
    )
    .then(() => {
      console.log(
        `Processing submission for ${req.body.fullname} from ${req.body.city}.`
      );

      return utils.submitProfile(
        req.body.fullname,
        req.body.city,
        req.body.markdown_de,
        req.body.markdown_en
      );
    })
    .catch(error => {
      console.log(`Error while processing submission: ${error}`);
      return res.render('index', {
        title: title,
        recaptchaKey: recaptchaKey,
        error: 'Sorry, something went wrong.',
      });
    })
    .then(pullrequestUrl => {
      console.log(
        `Successful processes submission for ${req.body.fullname} from ${req.body.city} to ${pullrequestUrl}.`
      );
      return res.render('index', {
        title: title,
        recaptchaKey: recaptchaKey,
        success: `Thanks for submitting your profile. You can view the pull request at `,
        url: pullrequestUrl,
      });
    });
});

module.exports = router;
