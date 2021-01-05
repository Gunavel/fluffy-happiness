const shell = require("shelljs");
const log4js = require("log4js");
const { setupGithub } = require("./setupGithubRepo");
const { setupCrowdin } = require("./setupCrowdinProject");
const { updateReadme } = require("./updateReadme");

/**
 * Init Logger
 */
const logger = log4js.getLogger("setup");
logger.level = "info";

/**
 * Read the inputs
 */
const [srcConfigFile, appConfigFile] = process.argv.slice(2);

if (!srcConfigFile) {
  logger.error("Source config file not provided");
  shell.exit(1);
}

if (!appConfigFile) {
  logger.error("App config file not provided");
  shell.exit(1);
}

/**
 * Run setup scripts
 */
async function runSetup() {
  logger.info("Setup started!");

  try {
    // await setupGithub(srcConfigFile, appConfigFile);

    //shell.cd("../../");
    // await setupCrowdin(appConfigFile);

    shell.cd("../../");
    await updateReadme();
  } catch (e) {
    logger.error("Error in setup scripts");
    logger.error(e);
    shell.exit(1);
  }

  logger.info("Setup finished!");
}

runSetup();
