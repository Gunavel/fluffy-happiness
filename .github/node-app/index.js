import crowdin, { ProjectsGroupsModel } from "@crowdin/crowdin-api-client";

const token = process.env["TOK"];
const [, repo] = process.env.GITHUB_REPOSITORY.split("/");

const Crowdin = crowdin.default;

// initialization of crowdin client
const { projectsGroupsApi } = new Crowdin({
  token,
});

// // You can also use async/wait. Add `async` keyword to your outer function/method
// async function getProjects() {
//   try {
//     const projects = await projectsGroupsApi.listProjects();
//     console.log(projects);
//   } catch (error) {
//     console.error(error);
//   }
// }

// await getProjects();

async function createProject() {
  try {
    const request = {
      name: repo,
      identifier: repo,
      sourceLanguageId: "en-GB",
      targetLanguageIds: ["en-US"],
      description: `Vault of ${repo} translations`,
      type: ProjectsGroupsModel.Type.FILES_BASED,
      skipUntranslatedStrings: true,
      skipUntranslatedFiles: false,
      exportApprovedOnly: true,
      languageAccessPolicy: ProjectsGroupsModel.LanguageAccessPolicy.OPEN,
      visibility: ProjectsGroupsModel.JoinPolicy.PRIVATE,
      translateDuplicates: 2,
      inContext: true,
      inContextPseudoLanguageId: "ach-UG",
      autoTranslateDialects: true,
    };

    console.log("Request: ", request);

    const { name, projectId } = await projectsGroupsApi.addProject(request);
    console.log("Details: ", name, projectId);
  } catch (error) {
    console.log(error);
  }
}

createProject();
