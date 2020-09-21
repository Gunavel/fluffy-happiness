/* eslint-disable no-console */
/*
  Analyze installed dependencies using `depcheck` npm module.
  1. Creates a dependencies.json file with unused dependencies/devDependencies
  2. Array of dependencies are passed to `deps-processor.js` for purging safely

  Usage:
  - run `node depcheck.js` and look for any logs/errors for further info.
  - (or)
  - run using `npm run depcheck` which does the same

  Known Issues:
  - running depcheck as spawn cmd in win32 systems seems to fail
*/
const { spawn } = require('child_process');
const fs = require('fs');

if (process.platform === 'win32') {
  console.log('<'.repeat(50));
  console.error('\nWindows sucks!! Please run this on linux based OS.\n');
  console.log('>'.repeat(50));

  process.exit(1);
}

// dependency processor local module
const depsProcessor = require('./deps-processor');

// file for storing output of depcheck cmd
const fileName = 'dependencies.json';

// console stream to output the console.log directly to a file
const myLogFileStream = fs.createWriteStream(fileName);
const myConsole = new console.Console(myLogFileStream, myLogFileStream);

console.log('Running depcheck...');
// Run depcheck npm module with optional flags
// see https://www.npmjs.com/package/depcheck for additional configs
const depcheck = spawn('depcheck', ['--skip-missing=true', '--json']);

depcheck.stdout.on('data', data => {
  // writes directly to filestream
  myConsole.log(`${data}`);
});

depcheck.on('error', () => {
  console.log('<'.repeat(50));
  console.error('Failed to exec depcheck.\n');

  console.log('Node version: ', process.version);
  const currentNodeMajorVersion = Number(process.version.match(/^v(\d+\.)/)[1]);

  if (currentNodeMajorVersion < 10) {
    console.error('Node version should be >=10 for depcheck to run.');
  }

  console.log("Make sure to 'npm i -g depcheck' before running this file.");
  console.log('>'.repeat(50));
  process.exit(1);
});

depcheck.stdout.on('close', () => {
  try {
    const { dependencies, devDependencies } = JSON.parse(
      fs.readFileSync(fileName, 'utf8'),
    );

    const deps = [...dependencies, ...devDependencies];
    if (deps.length === 0) {
      console.log(
        'All good. There are no unused dependencies in your project.',
      );
      process.exit();
    }

    console.log('-'.repeat(50));
    console.log('See dependencies.json file at the project root.');
    console.log('-'.repeat(50));

    // Process the collected dependencies
    depsProcessor(deps);
  } catch (e) {
    console.error('Depcheck error: ', e);
    process.exit(1);
  }
});
