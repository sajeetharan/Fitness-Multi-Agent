const { CosmosClient } = require("@azure/cosmos");
const { clientConfig, databaseId, containerId } = require("./config");

let client;
let container;

function getContainer() {
  if (!client) {
    client = new CosmosClient(clientConfig);
  }

  if (!container) {
    container = client.database(databaseId).container(containerId);
  }

  return container;
}

module.exports = { getContainer };
