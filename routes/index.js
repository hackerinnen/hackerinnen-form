const express = require('express');
const router = express.Router();
const utils = require('./../utils');

const title = 'Hackerinnen.space - submit your profile';

router.get('/', function(req, res, next) {
  res.render('index', { title: title });
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
      error: 'Please fill out all fields.',
    });
  }

  console.log(
    `Processing submission for ${req.body.fullname} from ${req.body.city}.`
  );

  utils
    .submitProfile(
      req.body.fullname,
      req.body.city,
      req.body.markdown_de,
      req.body.markdown_en
    )
    .then(pullrequestUrl => {
      console.log(
        `Successful processes submission for ${req.body.fullname} from ${req.body.city} to ${pullrequestUrl}.`
      );
      res.render('index', {
        title: title,
        success: `Thanks for submitting your profile. You can view the pull request at `,
        url: pullrequestUrl,
      });
    })
    .catch(error => {
      console.log(`Error while processing submission: ${error}`);
      return res.render('index', {
        title: title,
        error: 'Sorry, something went wrong.',
      });
    });
});

module.exports = router;
