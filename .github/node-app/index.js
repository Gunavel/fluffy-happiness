import crowdin from "@crowdin/crowdin-api-client";

const token = process.env["TOK"];

// initialization of crowdin client
const { projectsGroupsApi } = new crowdin({
  token,
});

// You can also use async/wait. Add `async` keyword to your outer function/method
async function getProjects() {
  try {
    const projects = await projectsGroupsApi.listProjects();
    console.log(projects);
  } catch (error) {
    console.error(error);
  }
}

await getProjects();
