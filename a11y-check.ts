const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ProgressBar = require('progress');
const _ = require('lodash');
const { spawn } = require('child_process');
const { cpus } = require('os');
const { ensureDirSync } = require('fs-extra');
const Bluebird = require('bluebird');

const pages = fs.readFileSync('pages.txt').toString().split('\n');
const total = pages.length;
const concurrency = cpus().length / 8;
const bar = new ProgressBar('[:bar] :current/:total :percent :rate/s :etas', {
  complete: '=',
  incomplete: ' ',
  width: 20,
  total,
});
const results = {};

function delegatePageCheck(page) {
  return new Bluebird((resolve, reject) => {
    let child = spawn('lighthouse', [
      `http://localhost:4000${page.substr(1)}`,
      '--only-categories=accessibility',
      '--quiet',
      '--chrome-flags="--headless"',
      '--output=json',
      `--output-path=${path.join('./z', path.parse(page).name)}.json`,
    ]);

    child.on('exit', (code) => {
      bar.tick(1);
      resolve();
    });
  });
}

async function main() {
  try {
    await Bluebird.map(pages, delegatePageCheck, {
      concurrency,
    });
  } catch (err) {
    console.error(err);
  }
}

main();
