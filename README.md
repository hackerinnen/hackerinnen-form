# Hackerinnen form

Provides a form to submit a pull request to https://github.com/normade/hackerinnen in order to add a new profile page.

App can be found in production here: https://submit.hackerinnen.space

## Run the app locally

1. Clone the repo
2. Change into the repo folder
3. Create new file named .env in the root dir
4. Add the following environment variabled to the .env file
  
    - BOT_GITHUB: github account that will create the pull rquest 
    - GITHUB_AUTH_TOKEN: auth token from the bot github account https://github.com/settings/tokens
    - RECAPTCHA: from google recaptcha site https://www.google.com/recaptcha

    ```
    BOT_GITHUB_USER=
    BOT_GITHUB_PASSWORD=
    GITHUB_AUTH_TOKEN=
    RECAPTCHA_KEY=
    RECAPTCHA_SECRET=
    ```
  
5. Run `npm install`
6. Run `nodemon` to start a local server
7. See the page at localhost:3000



