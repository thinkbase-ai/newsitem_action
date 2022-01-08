const core = require('@actions/core');
const github = require('@actions/github');
const gql = require('graphql-request');
const { v4: uuidv4 } = require('uuid');

try {
  //Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  const commit = github.context.payload.commits[0];
  const message = commit.message;
  const author = commit.author.name;
  const timestamp = commit.timestamp;
  const repo = github.context.payload.repository;
  const project = repo.name;
  const org = repo.organization;
  const visibility = repo.visibility;
  const apiKey = core.getInput('apiKey');
  const endpoint = 'https://darl.dev/graphql';
  const subjectId = uuidv4();

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      authorization: 'Basic ' + apiKey,
    },
  })

  const query = gql`
  mutation cks($subjectId: String! $title: String! $content: String!)
    {
    createKnowledgeState(ks: 
    {
        subjectId: $subjectId
        knowledgeGraphName: "backoffice_test.graph"
        data: [
        {
            name: "newsitem"
            value: [
            {
            lineage: "noun:01,4,05,13,09+noun:01,3,14,01,06,21"
            value: $title
            type:  TEXTUAL
            name: "title"
            }
            {
            lineage: "noun:01,4,05,13,09+noun:01,4,05,21,05"
            value: $content
            type:  TEXTUAL
            name: "content"
            }
            {
            lineage: "noun:01,4,05,13,09+noun:01,0,0,15,07,02,02"
            value: "code"
            type:  CATEGORICAL
            name: "category"
            }
        ]
        }
        ]
    }
    )
    {
        knowledgeGraphName
        subjectId
    }
    }
  `;
  const variables = {
    "subjectId": subjectId,
    "title": "Update of " + visibility + " " + project + " from " + org + ".",
    "content": "Updates are: '" + message + "' made by " + author + " at " + timestamp + ".",
  };

  const data = request(query, variables);
  console.log(JSON.stringify(data, undefined, 2));
} catch (error) {
  core.setFailed(error.message);
}