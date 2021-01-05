const fs = require("fs");

const apps = [
  {
    name: "Abc",
    githubRepo: "https://github.com/Gunavel/Abc",
    crowdinProject: "https://crowdin.com/project/unibuddy-apps",
    maintainers: ["Gunavel"],
  },
  {
    name: "Def",
    githubRepo: "https://github.com/Gunavel/Def",
    crowdinProject: "https://crowdin.com/project/unibuddy-apps",
    maintainers: ["Gunavel", "Gunavel"],
  },
];

// const apps = [];

function getJSON(file) {
  // Get content from file
  return JSON.parse(fs.readFileSync(file));
}

module.exports = {
  getJSON,
  apps,
};
