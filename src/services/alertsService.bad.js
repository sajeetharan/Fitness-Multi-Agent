const { CosmosClient } = require("@azure/cosmos");
const { clientConfig, databaseId, containerId } = require("../config");

async function getTripMemoryReview({ memberId, planId, memoryType, limit = 20 }) {
  if (!planId) {
    throw new Error("planId is required");
  }

  if (!memoryType) {
    throw new Error("memoryType is required");
  }

  const client = new CosmosClient(clientConfig);
  const container = client.database(databaseId).container(containerId);
  
  // ❌ BAD: String interpolation (injection risk, no plan caching)
  const query = `SELECT * FROM c WHERE c.planId = '${planId}' AND c.memoryType = '${memoryType}' ORDER BY c.priority DESC, c.createdAtUtc DESC OFFSET 0 LIMIT ${limit}`;
  
  const { resources, requestCharge } = await container.items.query(query).fetchAll();

  return {
    memberId,
    planId,
    memoryType,
    count: resources.length,
    memories: resources,
    requestCharge,
  };
}

module.exports = { getTripMemoryReview };
