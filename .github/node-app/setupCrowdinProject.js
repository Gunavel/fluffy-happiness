const shell = require("shelljs");
const log4js = require("log4js");
const crowdin = require("@crowdin/crowdin-api-client");
const { ProjectsGroupsModel } = require("@crowdin/crowdin-api-client");
const { getJSON } = require("./util");

/**
 * Init Logger
 */
const logger = log4js.getLogger("setupCrowdin");
logger.level = "info";

/**
 * Init Crowdin client
 */
const crowdin_token = process.env.CROWDIN_API_TOKEN;
const Crowdin = crowdin.default;
const { projectsGroupsApi } = new Crowdin({
  token: crowdin_token,
});

async function createProject(appName) {
  logger.info(`Creating crowdin project ${appName}!`);

  try {
    const request = {
      name: appName,
      identifier: appName,
      sourceLanguageId: "en-GB",
      targetLanguageIds: ["en-US"],
      description: `Vault of ${appName} translations`,
      type: ProjectsGroupsModel.Type.FILES_BASED,
      skipUntranslatedStrings: true,
      skipUntranslatedFiles: false,
      exportApprovedOnly: true,
      languageAccessPolicy: ProjectsGroupsModel.LanguageAccessPolicy.OPEN,
      visibility: ProjectsGroupsModel.JoinPolicy.PRIVATE,
    };

    const { data, errors } = await projectsGroupsApi.addProject(request);
    if (errors) {
      const hasNotUniqueError = errors.find((x) =>
        x.error.errors.find((y) => y.code === "notUnique")
      );
      if (hasNotUniqueError) {
        logger.warn(
          `Crowdin Project with name ${appName} already exists. Please use a global unique name.`
        );
      }

      shell.exit(0);
    }

    return data;
  } catch (e) {
    logger.error("Error: Create Project: ", JSON.stringify(e));
    shell.exit(1);
  }
}

async function editProject(projectId) {
  logger.info(`Editing crowdin project!`);

  try {
    const editRequest = [
      {
        op: "replace",
        path: "/translateDuplicates",
        value: 2,
      },
      {
        op: "replace",
        path: "/inContext",
        value: true,
      },
      {
        op: "replace",
        path: "/inContextPseudoLanguageId",
        value: "ach",
      },
      {
        op: "replace",
        path: "/autoTranslateDialects",
        value: true,
      },
    ];

    await projectsGroupsApi.editProject(projectId, editRequest);
  } catch (e) {
    logger.error("Error: Edit Project: ", JSON.stringify(e));
    shell.exit(1);
  }
}

async function setupCrowdin(appConfigFile) {
  try {
    const { name: appName } = getJSON(appConfigFile);

    const { id: projectId } = await createProject(appName);
    await editProject(projectId);
    logger.info(`Crowdin Project ${appName} created successfully!`);
  } catch (e) {
    logger.error("Error in Crowdin setup");
    logger.error(e);
    shell.exit(1);
  }
}

module.exports = {
  setupCrowdin,
};
