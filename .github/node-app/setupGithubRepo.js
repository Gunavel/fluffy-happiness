/**
 * Create a new translations repo of the original repo in [source config]
 *
 * YOU MUST HAVE ADMIN ACCESS TO THE ORGANIZATION FOR THIS TO WORK.
 * BEHAVIOR IF YOU ARE NOT AN OWNER IS UNDEFINED.
 *
 * Given the following files:
 *
 * `config.json`
 * ```
 * {
 *   "owner": "Unibuddy",
 *   "repository": "translations-app-template"
 * }
 * ```
 *
 * `widget.json`
 * ```
 * {
 *   "name": "widget",
 *   "maintainers": ["name1", "name2"]
 * }
 * ```
 *
 * Running this script:
 *
 * ```
 * node scripts/setup.js config.json apps/widget.json
 * ```
 *
 * will have the following effects:
 *
 * * Create a new repository Unibuddy/translations-widget with the current contents of translations-app-template except the .github directory
 * * Create a new team under unibuddy engineering team and provide access to all people listed in `maintainers`
 */
const shell = require("shelljs");
const log4js = require("log4js");
const { Octokit } = require("@octokit/rest");
const { getJSON } = require("./util");

/**
 * Init Logger
 */
const logger = log4js.getLogger("setupGithub");
logger.level = "info";

/**
 * Init Octakit
 */
const github_token = process.env.TECH_BOT_ACCESS_TOKEN;
const octokit = new Octokit({
  auth: `token ${github_token}`,
  previews: ["hellcat-preview"],
});

async function doesRepoExist(owner, newRepoName) {
  const {
    data: { total_count },
  } = await octokit.search.repos({
    q: `org:${owner} "${newRepoName}"`,
  });
  return total_count > 0;
}

async function addTeamMembers(owner, team_slug, members, role) {
  logger.info(`Adding team members to ${team_slug}!`);

  await Promise.all(
    members.map(async (username) => {
      await octokit.teams.addOrUpdateMembershipForUserInOrg({
        org: owner,
        team_slug,
        username,
        role,
      });
    })
  );
}

async function giveTeamRepoAccess(owner, team_slug, newRepoName) {
  logger.info(`Updating team ${team_slug} permissions!`);

  await octokit.teams.addOrUpdateRepoPermissionsInOrg({
    org: owner,
    team_slug,
    owner,
    repo: newRepoName,
    permission: "admin",
  });
}

async function createTeam(
  owner,
  parent_team_slug,
  appName,
  maintainers,
  newRepoName
) {
  logger.info("Creating new team");
  // Find the parent team id
  const {
    data: { id: parent_team_id },
  } = await octokit.teams.getByName({
    org: owner,
    team_slug: parent_team_slug,
  });

  // Make the team...
  const {
    data: { slug: team_slug },
  } = await octokit.teams.create({
    org: owner,
    name: appName,
    description: `Discuss on ${appName} translations.`,
    privacy: "closed",
    parent_team_id,
  });

  logger.info(`Team ${team_slug} created!`);

  await Promise.all([
    giveTeamRepoAccess(owner, team_slug, newRepoName),
    addTeamMembers(owner, team_slug, maintainers, "maintainer"),
  ]);

  logger.info("Set up a new team and invited maintainers!");
}

function pushOriginalContents(
  templateRepoUrl,
  repository,
  defaultBranch,
  newRepoUrl,
  newRepoName
) {
  logger.info("Setting up contents for new repo!");

  shell.cd("repo");

  // If we can't find the repo, clone it
  if (shell.cd(repository).code !== 0) {
    logger.debug("Can't find source repo locally. Cloning it!");
    shell.exec(`git clone ${templateRepoUrl} ${repository}`);
    logger.debug("Finished Cloning.");
    shell.cd(repository);
  }

  shell.exec('git config --global user.email "technology@unibuddy.com"');
  shell.exec('git config --global user.name "Unibuddy CI"');

  shell.exec(`git pull origin ${defaultBranch}`);
  shell.exec(`git remote add ${newRepoName} ${newRepoUrl}`);
  shell.exec(`git push -u ${newRepoName} ${defaultBranch}`);
}

async function setupGithub(srcConfigFile, appConfigFile) {
  try {
    const { owner, repository, parent_team_slug } = getJSON(srcConfigFile);
    const { name: appName, maintainers } = getJSON(appConfigFile);

    const newRepoName = `translations-${appName}`;
    const defaultBranch = "master";

    const templateRepoUrl = `https://${owner}:${github_token}@github.com/${owner}/${repository}.git`;
    const newRepoUrl = `https://${owner}:${github_token}@github.com/${owner}/${newRepoName}.git`;

    if (await doesRepoExist(owner, newRepoName)) {
      logger.warn(`Repo ${newRepoName} exists already.`);
      shell.exit(0);
    }

    logger.info("Creating new repo in GitHub");
    await octokit.repos.createInOrg({
      org: owner,
      name: newRepoName,
      private: true,
      description: `Translations repo for Unibuddy ${appName} Application`,
    });

    await Promise.all([
      createTeam(owner, parent_team_slug, appName, maintainers, newRepoName),
      pushOriginalContents(
        templateRepoUrl,
        repository,
        defaultBranch,
        newRepoUrl,
        newRepoName
      ),
    ]);
    logger.info(`New ${newRepoName} repo setup is complete!`);
  } catch (e) {
    logger.error("Error in Github setup");
    logger.error(e);
    shell.exit(1);
  }
}

module.exports = {
  setupGithub,
};
