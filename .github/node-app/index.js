/**
 * Run [command] on the given [configFile] on all languages in the given [langDir]
 *
 * ```
 * runAll [command] [configfile] [langDir]
 * ```
 */
const fs = require("fs");
const Promise = require("bluebird");
const shell = Promise.promisifyAll(require("shelljs"));

const [configFile, appsDir] = ["config.json", "apps"];
const appFiles = fs.readdirSync(appsDir);

// Make the repo directory now so that child processes don't error out
if (shell.ls("repo").code !== 0) {
  console.log("Creating Repo:");
  shell.mkdir("repo");
  shell.exec("echo $PWD");
}

// We run the script separately for each language so that the shelljs global state
// (e.g. working directory) doesn't interfere between runs
Promise.map(appFiles, (appFile) => {
  const path = `${appsDir}/${appFile}`;
  return shell.execAsync(`node setup.js ${configFile} ${path}`);
});
