/**
 * Create a new translation of the original repo in [source config] with the info in [trans config].
 *
 * YOU MUST HAVE ADMIN ACCESS TO THE ORGANIZATION FOR THIS TO WORK.
 * BEHAVIOR IF YOU ARE NOT AN OWNER IS UNDEFINED.
 *
 * ```
 * node scripts/create.js [source config] [trans config]
 * ```
 *
 * Given the following files:
 *
 * `config.json`
 * ```
 * {
 *   "owner": "reactjs",
 *   "repository": "reactjs.org",
 *   "teamSlug": "reactjs-localization"
 * }
 * ```
 *
 * `arr.json`
 * ```
 * {
 *   "name": "Japanese",
 *   "code": "ja",
 *   "maintainers": ["smikitky", "potato4d"]
 * }
 * ```
 *
 * Running this script:
 *
 * ```
 * node scripts/create.js config.json ja.json
 * ```
 *
 * will have the following effects:
 *
 * * Create a new repository reactjs/ja.reactjs.org with the current contents of reactjs.org
 * * Create a new issue in this repo "Japanese Translation Progress" with a list
 *   of pages to translate
 * * Create a team "reactjs.org Japanese Translation" and invite all people listed in `maintainers`
 *   to the reactjs organization and give them access to the repository
 */
const fs = require("fs");
const shell = require("shelljs");
const log4js = require("log4js");
const { Octokit } = require("@octokit/rest");
const { getJSON } = require("./util");
// shell.config.silent = true;

const [srcConfigFile, appConfigFile] = process.argv.slice(2);
if (!srcConfigFile) {
  throw new Error("Source config file not provided");
}
if (!appConfigFile) {
  throw new Error("Language config file not provided");
}

const { owner, repository } = getJSON(srcConfigFile);
const { name: appName, maintainers } = getJSON(appConfigFile);

const logger = log4js.getLogger(appName);
logger.level = "info";

const originalUrl = `https://github.com/${owner}/${repository}.git`;

const newRepoName = `translations-${appName}`;
const defaultBranch = "master";

const token = process.env.MY_SECRET;
const octokit = new Octokit({
  auth: `token ${token}`,
  previews: ["hellcat-preview"],
});

async function doesRepoExist() {
  console.log(owner, newRepoName);
  const {
    data: { total_count },
  } = await octokit.search.repos({
    q: `org:${owner} "${newRepoName}"`,
  });
  return total_count > 0;
}

async function createProgressIssue() {
  // Create the progress-tracking issue from the template
  const rawBody = fs.readFileSync("./PROGRESS.template.md", "utf8");
  const maintainerList = maintainers.map((name) => `* @${name}`).join("\n");
  const body = rawBody.replace("{MAINTAINERS}\n", maintainerList);
  await octokit.issues.create({
    owner,
    repo: newRepoName,
    title: `${langName} Translation Progress`,
    body,
  });
  logger.info("Created issue to track translation progress.");
}

async function addTeamMembers(team_id, members, role) {
  await Promise.all(
    members.map(async (username) => {
      await octokit.teams.addOrUpdateMembership({
        team_id,
        username,
        role,
      });
    })
  );
}

async function giveTeamRepoAccess(team_id) {
  await octokit.teams.addOrUpdateRepo({
    team_id,
    owner,
    repo: newRepoName,
    permission: "admin",
  });
}

async function createTeam() {
  // Find the parent team id
  // TODO this may fail once we have more than *100* teams in the main org
  const { data: allTeams } = await octokit.teams.list({
    org: owner,
    per_page: 100,
  });
  const parent_team_id = allTeams.find((team) => team.slug === teamSlug).id;

  // Make the team...
  const {
    data: { id: team_id },
  } = await octokit.teams.create({
    org: owner,
    name: `${repository} ${langName} translation`,
    description: `Discuss the translation of ${repository} into ${langName}.`,
    privacy: "closed",
    parent_team_id,
  });

  await Promise.all([
    giveTeamRepoAccess(team_id),
    addTeamMembers(team_id, maintainers, "maintainer"),
  ]);

  logger.info("Set up a new team and invited maintainers!");
}

function pushOriginalContents() {
  shell.cd("repo");
  shell.exec("echo $PWD");

  logger.info("Can't find source repo locally. Cloning it...");
  shell.exec(`git clone ${originalUrl} ${repository}`);
  logger.info("Finished cloning.");
  shell.cd(repository);
  shell.exec("echo $PWD");
  shell.exec("ls");

  // // Set the remote to the newly created repo
  shell.exec(`git pull origin ${defaultBranch}`);
  const newRepoUrl = `https://${owner}:${token}@github.com/${owner}/${newRepoName}.git`;
  shell.exec(`git remote set-url ${newRepoName} ${newRepoUrl}`);
  logger.info("1");
  // shell.exec(`git remote add ${newRepoName} ${newRepoUrl}`);
  logger.info("2");
  shell.exec("rm -rf .github");
  logger.info("3");
  shell.exec(`git push -u ${newRepoName} ${defaultBranch}`);
  logger.info("4");
  logger.info("Duplicated original repo");
}

// TODO it would be nice to do this as part of an automatic process,
// but I'm too scared not to do it manually rn
async function setupRepositoryAndTeam() {
  // if (await doesRepoExist()) {
  //   logger.warn("Repo exists already.");
  //   return;
  // }

  // logger.debug("Creating new repo in GitHub...");
  // await octokit.repos.createInOrg({
  //   org: owner,
  //   name: newRepoName,
  //   // TODO generalize this (maybe get from the head repo?)
  //   description: `(Work in progress) React documentation website`,
  // });
  // logger.info("Finished creating repo!");

  // Create the progress-tracking issue from the template
  await Promise.all([pushOriginalContents()]);
}

setupRepositoryAndTeam();
