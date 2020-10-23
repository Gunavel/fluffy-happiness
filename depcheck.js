/* eslint-disable no-console */
/*
  Analyze installed dependencies using `depcheck` npm module.
  1. Runs `depcheck` to find unused dependencies/devDependencies
  2. Result array of unused dependencies are passed to `deps-processor.js` for purging safely

  Usage:
  - run `node depcheck.js` and look for any logs/errors for further info.
  - (or)
  - run using `npm run depcheck` which does the same

  Known Issues:
  - running depcheck as spawn cmd in win32 systems seems to fail
*/
const depcheck = require("depcheck");

if (process.platform === "win32") {
  console.log("<".repeat(50));
  console.error("\nWindows sucks!! Please run this on linux based OS.\n");
  console.log(">".repeat(50));

  process.exit(1);
}

// dependency processor local module
// const depsProcessor = require("./deps-processor");

try {
  const options = {
    skipMissing: true,
    ignoreDirs: ["dist", "build", "public", "_public"],
  };

  console.log("-".repeat(50));
  console.log("\nRunning depcheck...\n");

  // Run depcheck npm module with optional flags
  // see https://www.npmjs.com/package/depcheck for additional configs
  depcheck(process.cwd(), options, (unused) => {
    const deps = [...unused.dependencies, ...unused.devDependencies];
    if (deps.length === 0) {
      console.log("-".repeat(50));
      console.log("👍 No unused dependencies in your project.");
      console.log("-".repeat(50));
      process.exit();
    }

    console.log("-".repeat(50));
    console.log(
      `Found ${
        unused.dependencies.length
      } unused dependencies. ${unused.dependencies.join(", ")}`
    );
    console.log(
      `Found ${
        unused.devDependencies.length
      } unused devDependencies. ${unused.devDependencies.join(",")}`
    );
    console.log("-".repeat(50));

    // Process the collected dependencies
    // depsProcessor(deps);
  });
} catch (e) {
  console.log("<".repeat(50));
  console.error("Failed to exec depcheck.\n");

  console.log("Node version: ", process.version);
  const currentNodeMajorVersion = Number(process.version.match(/^v(\d+\.)/)[1]);

  if (currentNodeMajorVersion < 10) {
    console.error("Node version should be >=10 for depcheck to run.");
  }

  console.log("Make sure to 'npm i -D depcheck' before running this file.\n");
  console.log(">".repeat(50));
  process.exit(1);
}
