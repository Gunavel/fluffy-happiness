/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
/*
  Exported module `depsProcessor`.

  Takes in array of dependencies (eg. ['cheerio', 'react', ...]) and  does the following async ops.
  1. Uninstall each dep using `npm uninstall -S <dep>
  2. Re-build the project using `npm run build`
  3. If build fails, Re-install the dep
  4. Repeat this process for each entry in `deps` array which is passed as param to `depsProcessor` function.

  Usage:
  - exported module is used in `depcheck.js`. see `depcheck.js`
  - to run this module individually,
    use the exported `depsProcessor` module and call the function with array of deps as param.
*/
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const uninstalledDeps = [];
const falsePositiveDeps = [];
const failedDeps = [];

const uninstallDep = async dep => {
  try {
    console.log("Uninstalling: ", dep);
    const { /* stdout, */ error } = await exec(`npm uninstall -S ${dep}`);

    if (error) {
      console.log("Uninstal failed");
      // console.error(`exec uninstallDep error: ${error}`);
      return false;
    }

    // console.log('uninstall stdout:', stdout);
    console.log("Uninstalled: ", dep);
    return true;
  } catch (e) {
    console.log("Uninstal failed");
    // console.error(`exec uninstallDep error: ${e}`);
    return false;
  }
};

const installDep = async dep => {
  try {
    console.log("Installing: ", dep);
    const { /* stdout, */ error } = await exec(`npm install -S ${dep}`);

    if (error) {
      console.log("Install failed");
      // console.error(`exec installDep error: ${error}`);
      return false;
    }

    // console.log(`install stdout: ${stdout}`);
    console.log("Installed: ", dep);
    return true;
  } catch (e) {
    console.log("Install failed");
    // console.error(`exec installDep error: ${e}`);
    return false;
  }
};

const verifyBuild = async dep => {
  try {
    console.log(`Verifying build after uninstalling ${dep}.`);
    const { /* stdout, */ error } = await exec("npm run build");

    if (error) {
      console.error("Build failed");
      // console.error(`exec build error: ${error}`);
      return false;
    }

    // console.log(`build stdout: ${stdout}`);
    console.log("Build Success");
    return true;
  } catch (e) {
    console.error("Build failed");
    // console.error(`exec build error: ${e}`);
    return false;
  }
};

const handleInstallation = async dep => {
  const hasInstalled = await installDep(dep);

  if (hasInstalled) {
    falsePositiveDeps.push(dep);
    return { done: true };
  }

  failedDeps.push(dep);
  return { done: false };
};

const processDep = async dep => {
  const hasUninstalled = await uninstallDep(dep);

  if (hasUninstalled) {
    const hasBuildSucceeded = await verifyBuild(dep);

    if (hasBuildSucceeded) {
      uninstalledDeps.push(dep);
      return { done: true };
    }

    const installStatus = await handleInstallation(dep);
    return installStatus;
  }

  const installStatus = await handleInstallation(dep);
  return installStatus;
};

const depsProcessor = async deps => {
  if (!deps || !Array.isArray(deps)) {
    console.log("<".repeat(50));
    console.error("Invalid param deps. Should be an array.");
    console.log(">".repeat(50));
    process.exit(1);
  }

  if (Array.isArray(deps) && deps.length === 0) {
    console.error("No dependencies to purge. Exiting...\n");
    process.exit(0);
  }

  console.log("\nRunning deps processor...\n");
  console.log("-".repeat(50));
  console.time("Total Processing Time");

  for (let index = 0; index < deps.length; index++) {
    const dep = deps[index];

    console.log("Now Processing: ", dep);

    // Can make it pure async, so that every dep in processed in parallel.
    // Doing so will consume lot of memory, so running in series.
    // eslint-disable-next-line no-await-in-loop
    const { done } = await processDep(dep);

    if (done) {
      console.log("Processed: ", dep);
      console.log("-".repeat(50));
    } else {
      console.log("Failed to process: ", dep);
    }
  }

  console.timeEnd("Total Processing Time");

  console.log("-".repeat(50));
  console.log(`Successfully purged ${uninstalledDeps.length} dependencies.`);
  console.log("-".repeat(50));
  console.log("Successfully uninstalled: ", uninstalledDeps.join(", "));
  console.log("-".repeat(50));
  console.log(
    "False positives: ",
    falsePositiveDeps.length > 0 ? falsePositiveDeps.join(", ") : "None"
  );
  console.log("-".repeat(50));
  console.log(
    "Failed Dependencies: ",
    failedDeps.length > 0 ? failedDeps.join(", ") : "None"
  );
  console.log("-".repeat(50));
};

module.exports = depsProcessor;
