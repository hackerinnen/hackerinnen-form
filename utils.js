const cmd = require('cmd-executor');
const fs = require('fs');
const git = require('cmd-executor').git;
const Octokit = require('@octokit/rest');
const path = require('path');
const tmp = require('tmp-promise');

const OWNER = 'normade';
const REPONAME = 'hackerinnen';
const BOT_EMAIL = 'hello@hackerinnen.space';
const BOT_NAME = 'Hackerinnen bot';
const USER = process.env.BOT_GITHUB_USER;
const PASS = process.env.BOT_GITHUB_PASSWORD;
const GITHUB_AUTH_TOKEN = process.env.GITHUB_AUTH_TOKEN;

const repo = `https://${USER}:${PASS}@github.com/${USER}/${REPONAME}`;
let workingDirectory = '';

const octokit = new Octokit({
  auth: GITHUB_AUTH_TOKEN,
});

async function cloneRepo() {
  const tmpDir = await tmp.dir();
  workingDirectory = tmpDir.path;
  await process.chdir(`${workingDirectory}`);
  console.log(`Cloning repo to ${workingDirectory}`);
  return git.clone(repo);
}

function copyRepo(path) {
  console.log(`Copy repo to ${path}/${REPONAME}`);
  return cmd.cp(`-R ${workingDirectory}/${REPONAME} ${path}/${REPONAME}`);
}

function createDir(path) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path)) {
      try {
        fs.mkdirSync(path);
        console.log(`Directory at ${path} created.`);
        resolve(path);
      } catch (error) {
        console.log(`Error creating directory at ${path} with error: ${error}`);
        reject(path);
      }
    } else {
      console.log(`Directory at ${path} exists already.`);
      resolve(path);
    }
  });
}

function createCityFolder(cityname, tmpDirPath) {
  try {
    const cityPath = path.resolve(
      tmpDirPath,
      REPONAME,
      'content',
      'spaces',
      cityname
    );
    return Promise.all([
      createDir(cityPath),
      createCityMarkdownFileDE(cityname, tmpDirPath),
      createCityMarkdownFileEN(cityname, tmpDirPath),
    ]);
  } catch (error) {
    return new Promise((resolve, reject) => {
      return reject(error);
    });
  }
}

function createProfileFolder(cityname, username, tmpDirPath) {
  try {
    const userPath = path.resolve(
      tmpDirPath,
      REPONAME,
      'content',
      'spaces',
      cityname,
      username
    );
    return createDir(userPath);
  } catch (error) {
    return new Promise((resolve, reject) => {
      return reject(error);
    });
  }
}

function createCityMarkdownFileDE(cityname, tmpDirPath) {
  const date = new Date().toISOString();
  const data = `---
title: "${cityname}"
date: ${date}
---`;

  const filePath = path.resolve(
    tmpDirPath,
    REPONAME,
    'content',
    'spaces',
    cityname,
    '_index.md'
  );
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      fs.writeFile(filePath, data, error => {
        if (error) {
          reject(error);
        }
        console.log(`DE Markdown file at ${filePath} created.`);
        resolve(filePath);
      });
    } else {
      console.log(`DE Markdown file exists already at ${filePath}`);
      resolve(filePath);
    }
  });
}

function createCityMarkdownFileEN(cityname, tmpDirPath) {
  const date = new Date().toISOString();
  const data = `---
title: "${cityname}"
date: ${date}
---`;
  const filePath = path.resolve(
    tmpDirPath,
    REPONAME,
    'content',
    'spaces',
    cityname,
    '_index.en.md'
  );
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      fs.writeFile(filePath, data, error => {
        if (error) {
          reject(error);
        }
        console.log(`EN Markdown file at ${filePath} created.`);
        resolve(filePath);
      });
    } else {
      console.log(`EN Markdown file exists already at ${filePath}`);
      resolve(filePath);
    }
  });
}

function createMarkdownFileDE(data, cityname, username, tmpDirPath) {
  const filePath = path.resolve(
    tmpDirPath,
    REPONAME,
    'content',
    'spaces',
    cityname,
    username,
    'index.md'
  );
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, error => {
      if (error) {
        reject(error);
      }
      resolve(filePath);
    });
  });
}

function createMarkdownFileEN(data, cityname, username, tmpDirPath) {
  const filePath = path.resolve(
    tmpDirPath,
    REPONAME,
    'content',
    'spaces',
    cityname,
    username,
    'index.en.md'
  );
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, error => {
      if (error) {
        reject(error);
      }
      resolve(filePath);
    });
  });
}

function formatString(str) {
  try {
    return str.replace(/\s+/g, '-').toLowerCase();
  } catch (error) {
    return new Promise((resolve, reject) => {
      reject(error);
    });
  }
}

async function createPullRequest(cityname, username, tmpFolder) {
  try {
    await process.chdir(`${tmpFolder}/${REPONAME}`);
    await git.config('user.email', BOT_EMAIL);
    await git.config('user.name', BOT_NAME);

    const branchName = username;

    await git.branch(branchName);
    await git.checkout(branchName);
    await git.add(`content/spaces/${cityname}/*.md`);
    await git.add(`content/spaces/${cityname}/${username}/*.md`);
    let commitMessage = `Add profile for ${username} from ${cityname}`;
    await git.commit('-m "' + commitMessage + '"');
    await git.push('-u', 'origin', branchName);

    const pullrequestData = await octokit.pulls.create({
      owner: OWNER,
      repo: REPONAME,
      title: commitMessage,
      head: `${USER}:${branchName}`,
      base: 'master',
      body:
        'This pull request was automatically generated. Thanks for submitting your profile at hackerinnen@herokuapp.com.',
    });

    console.log(
      `Successfully created pull request ${pullrequestData.data.html_url} for ${username} from ${cityname}.`
    );

    return pullrequestData.data.html_url;
  } catch (error) {
    console.error(error);
  }
}

async function submitProfile(
  _username,
  _cityname,
  _filecontentDE,
  _filecontentEN
) {
  try {
    const username = formatString(_username);
    const cityname = formatString(_cityname);

    const tmpDir = await tmp.dir();
    const tmpDirPath = tmpDir.path;

    await copyRepo(tmpDirPath);
    await createCityFolder(cityname, tmpDirPath);
    await createProfileFolder(cityname, username, tmpDirPath);
    await createMarkdownFileDE(_filecontentDE, cityname, username, tmpDirPath);
    await createMarkdownFileEN(_filecontentEN, cityname, username, tmpDirPath);

    return await createPullRequest(cityname, username, tmpDirPath);
  } catch (error) {
    return new Promise((resolve, reject) => {
      return reject(error);
    });
  }
}

module.exports = { cloneRepo, submitProfile };
