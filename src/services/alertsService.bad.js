const { CosmosClient } = require("@azure/cosmos");
const { clientConfig, databaseId, containerId } = require("../config");

async function getTripMemoryReview({ memberId, planId, memoryType }) {
  if (!planId) {
    throw new Error("planId is required");
  }

  if (!memoryType) {
    throw new Error("memoryType is required");
  }

  // Intentional anti-patterns for live Agent Kit demo:
  // - New client on every request
  // - SELECT *
  // - Query string interpolation
  // - Missing memberId filter in a /memberId partitioned container
  const client = new CosmosClient(clientConfig);
  const container = client.database(databaseId).container(containerId);
  const query = `SELECT * FROM c WHERE c.planId = '${planId}' AND c.memoryType = '${memoryType}' ORDER BY c.priority DESC, c.createdAtUtc DESC`;
  const { resources } = await container.items.query(query).fetchAll();

  return {
    memberId,
    planId,
    memoryType,
    count: resources.length,
    memories: resources,
  };
}

module.exports = { getTripMemoryReview };
