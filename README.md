# Hackerinnen form

Small app that makes it easy to submit a pull request with a new profile to https://github.com/normade/hackerinnen.

## Run the app

Add the following environment variables to .env file:

- BOT_GITHUB, github account who will create the PR
- GITHUB_AUTH_TOKEN from the bot users account
- RECAPTCHA from google recaptcha site

```
BOT_GITHUB_USER=
BOT_GITHUB_PASSWORD=
GITHUB_AUTH_TOKEN=
RECAPTCHA_KEY=
RECAPTCHA_SECRET=
```

`npm install`

`nodemon`

Visit http://localhost:3000/
