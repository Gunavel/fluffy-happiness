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
    };

    console.log("Request: ", request);

    const data = await projectsGroupsApi.addProject(request);
    console.log("Details: ", data);

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
        value: "ach-UG",
      },
      {
        op: "replace",
        path: "/autoTranslateDialects",
        value: true,
      },
    ];

    // const edit = await projectsGroupsApi.editProject(projectId, editRequest);
    // console.log("Edit Details: ", edit);
  } catch (error) {
    console.log(error);
  }
}

createProject();
