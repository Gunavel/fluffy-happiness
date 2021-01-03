import crowdin, { ProjectsGroupsModel } from "@crowdin/crowdin-api-client";

const token = process.env["TOK"];
const [, repo] = process.env.GITHUB_REPOSITORY.split("/");

const Crowdin = crowdin.default;

// initialization of crowdin client
const { projectsGroupsApi } = new Crowdin({
  token,
});

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

    const { data } = await projectsGroupsApi.addProject(request);
    console.log("Create Project Response: ", data);

    const projectId = data.id;
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
        path: "/autoTranslateDialects",
        value: true,
      },
    ];

    const editResponse = await projectsGroupsApi.editProject(
      projectId,
      editRequest
    );
    console.log("Edit Project Response: ", editResponse);
  } catch (error) {
    console.log(JSON.stringify(error));
  }
}

createProject();
