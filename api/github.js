const fetch = require("node-fetch");

const GITHUB_API_URL = "https://api.github.com/graphql";
const REPO_OWNER = "rajvir-cms-bot";
const REPO_NAME = "hugo-content";
const REPO_NAME_WITH_OWNER = `${REPO_OWNER}/${REPO_NAME}`;

// --- Reusable helper function ---
async function makeGraphQLRequest(query, variables = {}) {
  const response = await fetch(GITHUB_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_PAT}`,
      "User-Agent": "decap-cms-local-proxy-graphql",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();

  if (response.status !== 200 || data.errors) {
    console.error("GraphQL API Error:", data.errors || data);
    const errorMessage = data.errors
      ? data.errors.map((err) => err.message).join(", ")
      : "Unknown GraphQL error";
    throw new Error(
      `GraphQL request failed with status ${response.status}: ${errorMessage}`
    );
  }

  return data.data;
}

// --- Main handler ---
module.exports = async (req, res) => {
  const { action, params } = req.body;

  console.log("--- Decap CMS GraphQL Proxy Log ---");
  console.log(`Action: ${action}`);
  console.log("Parameters:", params);

  try {
    switch (action) {
      case "entriesByFolder":
      case "getMedia":
        {
          const folderPath =
            action === "getMedia" ? params.mediaFolder : params.folder;
          const expression = `${params.branch}:${folderPath}`;

          const query = `
            query getContents($owner: String!, $repo: String!, $expression: String!) {
              repository(owner: $owner, name: $repo) {
                object(expression: $expression) {
                  ... on Tree {
                    entries {
                      name
                      type
                      oid
                      path
                      object {
                        ... on Blob {
                          byteSize
                        }
                      }
                    }
                  }
                }
              }
            }
          `;
          const variables = {
            owner: REPO_OWNER,
            repo: REPO_NAME,
            expression: expression,
          };

          const data = await makeGraphQLRequest(query, variables);
          const entries = data.repository.object?.entries || [];

          const files = entries
            .filter((entry) => entry && entry.type === "blob")
            .map((entry) => ({
              path: entry.path,
              name: entry.name,
              id: entry.oid,
              sha: entry.oid,
              size: entry.object?.byteSize,
              slug: entry.name.replace(/\.md$/, ""),
            }));

          res.status(200).json(files);
        }
        break;

      case "getEntry":
        {
          const expression = `${params.branch}:${params.path}`;
          const query = `
            query getFileContent($owner: String!, $repo: String!, $expression: String!) {
              repository(owner: $owner, name: $repo) {
                object(expression: $expression) {
                  ... on Blob {
                    oid
                    text
                    byteSize
                  }
                }
              }
            }
          `;
          const variables = {
            owner: REPO_OWNER,
            repo: REPO_NAME,
            expression: expression,
          };

          const data = await makeGraphQLRequest(query, variables);
          const fileData = data.repository.object;

          if (!fileData) {
            res.status(404).json({ message: "File not found." });
            return;
          }

          const filename = params.path.split("/").pop();
          const slug = filename.replace(/\.md$/, "");

          res.status(200).json({
            id: fileData.oid,
            sha: fileData.oid,
            content: Buffer.from(fileData.text).toString("base64"),
            path: params.path,
            size: fileData.byteSize,
            name: filename,
            slug: slug,
          });
        }
        break;

      case "persistEntry":
        {
          const file = params.dataFiles[0];

          const queryGetOID = `
            query getBranchOID($owner: String!, $repo: String!, $branch: String!) {
              repository(owner: $owner, name: $repo) {
                ref(qualifiedName: $branch) {
                  target {
                    oid
                  }
                }
              }
            }
          `;
          const variablesGetOID = {
            owner: REPO_OWNER,
            repo: REPO_NAME,
            branch: params.branch,
          };

          const branchData = await makeGraphQLRequest(
            queryGetOID,
            variablesGetOID
          );
          const branchOID = branchData.repository.ref.target.oid;

          const mutation = `
            mutation createCommit($branch: String!, $oid: GitObjectID!, $message: String!, $additions: [FileAddition!]) {
              createCommitOnBranch(
                input: {
                  branch: {
                    repositoryNameWithOwner: "${REPO_NAME_WITH_OWNER}",
                    branchName: $branch
                  }
                  expectedHeadOid: $oid
                  message: { headline: $message }
                  fileChanges: { additions: $additions }
                }
              ) {
                commit {
                  oid
                }
              }
            }
          `;
          const mutationVariables = {
            branch: params.branch,
            oid: branchOID,
            message: params.options.commitMessage,
            additions: [
              {
                path: file.path,
                contents: Buffer.from(file.raw).toString("base64"),
              },
            ],
          };

          await makeGraphQLRequest(mutation, mutationVariables);

          const getEntryQuery = `
            query getSavedEntry($owner: String!, $repo: String!, $expression: String!) {
              repository(owner: $owner, name: $repo) {
                object(expression: $expression) {
                  ... on Blob {
                    oid
                    text
                    byteSize
                  }
                }
              }
            }
          `;
          const getEntryVariables = {
            owner: REPO_OWNER,
            repo: REPO_NAME,
            expression: `${params.branch}:${file.path}`,
          };

          const savedData = await makeGraphQLRequest(
            getEntryQuery,
            getEntryVariables
          );
          const savedFileData = savedData.repository.object;

          if (!savedFileData) {
            res
              .status(500)
              .json({ error: "Failed to fetch saved entry metadata." });
            return;
          }

          const filename = file.path.split("/").pop();
          const slug = filename.replace(/\.md$/, "");

          res.status(200).json({
            id: savedFileData.oid,
            sha: savedFileData.oid,
            content: Buffer.from(savedFileData.text).toString("base64"),
            path: file.path,
            size: savedFileData.byteSize,
            name: filename,
            slug: slug,
          });
        }
        break;

      default:
        res.status(400).json({ error: `Unsupported action: ${action}` });
    }
  } catch (error) {
    console.error("Error in GraphQL proxy:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to proxy request to GitHub" });
  }
};
