const fs = require("fs");
const shell = require("shelljs");
const { apps } = require("./util");

async function updateReadme() {
  const appsList = apps.map((p) => {
    const mainters = p.maintainers.map((m) => `@${m}`).join(" ");
    return `| ${p.name} | [${p.githubRepo}] | [${p.crowdinProject}] | ${mainters} |`;
  });
  appsList.push("{APPS}");
  const appsListString = appsList.join("\n");

  const rawBody = fs.readFileSync("./TESTREADME.md", "utf8");
  const body = rawBody.replace("{APPS}\n", appsListString);

  fs.writeFileSync("TESTREADME.md", body);

  shell.exec('git config --global user.email "gunavel.bharathi@gmail.com"');
  shell.exec('git config --global user.name "Gunavel"');

  shell.exec("git add TESTREADME.md");
  shell.exec('git commit -m "updatedAppsList"');
  shell.exec("git push -u origin master");
}

module.exports = {
  updateReadme,
};
