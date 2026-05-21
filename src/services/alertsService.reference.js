const { getContainer } = require("../cosmosClient");

async function getTripMemoryReview({ memberId, planId, memoryType, limit = 20 }) {
  if (!memberId) {
    throw new Error("memberId is required");
  }

  if (!planId) {
    throw new Error("planId is required");
  }

  if (!memoryType) {
    throw new Error("memoryType is required");
  }

  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 50));
  const container = getContainer();
  const querySpec = {
    query: `SELECT TOP ${safeLimit} c.id, c.memberId, c.planId, c.memoryType, c.title, c.summary, c.priority, c.createdAtUtc
            FROM c
            WHERE c.memberId = @memberId AND c.planId = @planId AND c.memoryType = @memoryType
            ORDER BY c.priority DESC, c.createdAtUtc DESC`,
    parameters: [
      { name: "@memberId", value: memberId },
      { name: "@planId", value: planId },
      { name: "@memoryType", value: memoryType },
    ],
  };

  const { resources, requestCharge } = await container.items.query(querySpec).fetchAll();

  return {
    memberId,
    planId,
    memoryType,
    count: resources.length,
    requestCharge,
    memories: resources,
    recommendation: "For high-QPS ORDER BY workloads, validate composite index coverage for priority + createdAtUtc.",
  };
}

module.exports = { getTripMemoryReview };
