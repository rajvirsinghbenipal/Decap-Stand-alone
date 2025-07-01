const fetch = require("node-fetch");

const GITHUB_API_URL = "https://api.github.com/graphql";
const REPO_OWNER = "rajvir-cms-bot";
const REPO_NAME = "hugo-content";
const REPO_NAME_WITH_OWNER = `${REPO_OWNER}/${REPO_NAME}`;

// --- HARDCODED DATA FOR DEBUGGING ---
const HARDCODED_NEWS_ENTRIES = [
  {
    "path": "news/a.md",
    "name": "a.md",
    "id": "cd09d9553a588ea42eb8d15e6c50f9784b4134dd",
    "sha": "cd09d9553a588ea42eb8d15e6c50f9784b4134dd",
    "size": 23,
    "isDir": false
  },
  {
    "path": "news/cc.md",
    "name": "cc.md",
    "id": "2a35a1f5b599ffcff48dd2135f05ced2c9597c59",
    "sha": "2a35a1f5b599ffcff48dd2135f05ced2c9597c59",
    "size": 22,
    "isDir": false
  },
  {
    "path": "news/cs.md",
    "name": "cs.md",
    "id": "5615af7e5beeaef8940bd44e3e38a1d10ed7197e",
    "sha": "5615af7e5beeaef8940bd44e3e38a1d10ed7197e",
    "size": 22,
    "isDir": false
  },
  {
    "path": "news/csa.md",
    "name": "csa.md",
    "id": "6c63074bfb766a2aaf97c2115cfa3586ae6cefbd",
    "sha": "6c63074bfb766a2aaf97c2115cfa3586ae6cefbd",
    "size": 24,
    "isDir": false
  },
  {
    "path": "news/ds.md",
    "name": "ds.md",
    "id": "1ca41c003842cd9b40c86e920b8d378474ffcb14",
    "sha": "1ca41c003842cd9b40c86e920b8d378474ffcb14",
    "size": 36,
    "isDir": false
  },
  {
    "path": "news/fwef.md",
    "name": "fwef.md",
    "id": "adbb68845c9a7b0486df1498588cbc6284182fb1",
    "sha": "adbb68845c9a7b0486df1498588cbc6284182fb1",
    "size": 37,
    "isDir": false
  },
  {
    "path": "news/g.md",
    "name": "g.md",
    "id": "a57c0dd5d7adfa5c77a024c259d2cc33bcdf485c",
    "sha": "a57c0dd5d7adfa5c77a024c259d2cc33bcdf485c",
    "size": 21,
    "isDir": false
  },
  {
    "path": "news/gheloji.md",
    "name": "gheloji.md",
    "id": "a91a16b873883a99451ee6ea922ea0fc575e8eb5",
    "sha": "a91a16b873883a99451ee6ea922ea0fc575e8eb5",
    "size": 33,
    "isDir": false
  },
  {
    "path": "news/jb.md",
    "name": "jb.md",
    "id": "600652a1463b4dde07d87bbc92a381983fcbaec0",
    "sha": "600652a1463b4dde07d87bbc92a381983fcbaec0",
    "size": 37,
    "isDir": false
  },
  {
    "path": "news/placeholder.md",
    "name": "placeholder.md",
    "id": "cd682adc4a29b781279aac1db4ca0c69d78e563a",
    "sha": "cd682adc4a29b781279aac1db4ca0c69d78e563a",
    "size": 64,
    "isDir": false
  },
  {
    "path": "news/scs.md",
    "name": "scs.md",
    "id": "90d5fb5da3d48d7d9d566bffbfbe4d9c6521897b",
    "sha": "90d5fb5da3d48d7d9d566bffbfbe4d9c6521897b",
    "size": 23,
    "isDir": false
  },
  {
    "path": "news/sdad.md",
    "name": "sdad.md",
    "id": "f6d86493563e16a3857aa320d69b0c5cd7b797c9",
    "sha": "f6d86493563e16a3857aa320d69b0c5cd7b797c9",
    "size": 25,
    "isDir": false
  },
  {
    "path": "news/sv.md",
    "name": "sv.md",
    "id": "580a278b062897245811414de07021ad1e7b51e3",
    "sha": "580a278b062897245811414de07021ad1e7b51e3",
    "size": 24,
    "isDir": false
  },
  {
    "path": "news/v.md",
    "name": "v.md",
    "id": "ac1859f83f43d8f2dbaca5458e913dc7cfa3fe47",
    "sha": "ac1859f83f43d8f2dbaca5458e913dc7cfa3fe47",
    "size": 22,
    "isDir": false
  },
  {
    "path": "news/x.md",
    "name": "x.md",
    "id": "9d4dd26b61e508b01a583a699fb148cae3d2c0fb",
    "sha": "9d4dd26b61e508b01a583a699fb148cae3d2c0fb",
    "size": 35,
    "isDir": false
  }
];

const HARDCODED_MEDIA_ENTRIES = [
    {
        "path": "assets/uploads/readme",
        "name": "readme",
        "id": "d478889c64fd804256ad2b3c0770ef6bb3d6dc75",
        "sha": "d478889c64fd804256ad2b3c0770ef6bb3d6dc75",
        "size": 6,
        "isDir": false
    }
];
// --- END OF HARDCODED DATA ---


// --- Reusable helper function to make GraphQL requests ---
async function makeGraphQLRequest(query, variables = {}) {
  const response = await fetch(GITHUB_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_PAT}`,
      "User-Agent": "decap-cms-local-proxy-graphql",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
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

  console.log(data.data, 'tarun'); // Corrected console.log
  return data.data;
}

// --- Main proxy handler ---
module.exports = async (req, res) => {
  const { action, params } = req.body;

  // console.log("--- Decap CMS GraphQL Proxy Log ---"); // Keep these if needed for general flow
  // console.log(`Action: ${action}`);
  // console.log("Parameters:", params);

  try {
    // --- ADDED HARDCODING LOGIC HERE (INSIDE module.exports) ---
    if (action === "entriesByFolder" && params.folder === "news") {
        console.log("--- HARDCODED RESPONSE SERVED FOR 'news' FOLDER ---");
        res.status(200).json(HARDCODED_NEWS_ENTRIES);
        return; // Exit function after sending hardcoded response
    }
    if (action === "getMedia" && params.mediaFolder === "assets/uploads") {
        console.log("--- HARDCODED RESPONSE SERVED FOR 'assets/uploads' FOLDER ---");
        res.status(200).json(HARDCODED_MEDIA_ENTRIES); // Use specific hardcoded data for media
        return; // Exit function after sending hardcoded response
    }
    // --- END OF HARDCODING LOGIC ---

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

          // This call will only happen if the hardcoding conditions above are NOT met
          const data = await makeGraphQLRequest(query, variables); 

          const treeObject = data.repository.object;
          const entries = treeObject ? treeObject.entries : null;

          const files = entries
            ? entries
                .filter((entry) => entry)
                .map((entry) => ({
                  path: entry.path,
                  name: entry.name,
                  id: entry.oid,
                  sha: entry.oid,
                  size: entry.object ? entry.object.byteSize : undefined,
                  isDir: entry.type === 'tree',
                }))
            : [];

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

          res.status(200).json({
            id: fileData.oid,
            sha: fileData.oid,
            content: Buffer.from(fileData.text).toString("base64"),
            path: params.path,
            size: fileData.byteSize,
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

          res.status(200).json({
            id: savedFileData.oid,
            sha: savedFileData.oid,
            content: Buffer.from(savedFileData.text).toString("base64"),
            path: file.path,
            size: savedFileData.byteSize,
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