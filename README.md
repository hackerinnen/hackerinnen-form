# Hackerinnen form

The form is live at: https://submit.hackerinnen.space

To make it easy to submit a profile to https://hackerinnen.space we provide this form where you can enter you data. After submitting the form the app will create a pull request for https://github.com/hackerinnen/hackerinnen.

## How does it work?

This app serves a simple form where the user can enter name, city, upload a picture and update the markdown file to create a profile for https://hackerinnen.space.
When submitting the form the server validates the data and submits a pull request at behalf of the user. The pull request can reviewed by the user at https://github.com/hackerinnen/hackerinnen/pulls

## Run the app locally

1. Clone the repo
2. Change into the repo folder
3. Create a copy of the .env.tpl file named .env in the root dir
4. Add the following environment variables to the .env file

   - BOT_GITHUB: github account that will create the pull rquest
   - GITHUB_AUTH_TOKEN: auth token from the bot github account https://github.com/settings/tokens
   - RECAPTCHA: from google recaptcha site https://www.google.com/recaptcha (only needed for production)

   ```
   NODE_ENV=
   BOT_GITHUB_USER=
   BOT_GITHUB_PASSWORD=
   GITHUB_AUTH_TOKEN=
   RECAPTCHA_KEY=
   RECAPTCHA_SECRET=
   ```

5. Run `npm install`
6. Run `nodemon` to start a local server
7. See the page at localhost:3000
