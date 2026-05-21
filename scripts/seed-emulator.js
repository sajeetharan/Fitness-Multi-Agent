const fs = require("fs");
const path = require("path");
const { CosmosClient } = require("@azure/cosmos");
const { clientConfig, databaseId, containerId } = require("../src/config");

async function main() {
  const client = new CosmosClient(clientConfig);
  const dataPath = path.join(__dirname, "..", "data", "fitness-memories.json");
  const docs = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  const { database } = await client.databases.createIfNotExists({ id: databaseId });
  const { container } = await database.containers.createIfNotExists({
    id: containerId,
    partitionKey: { paths: ["/memberId"] },
  });

  for (const doc of docs) {
    await container.items.upsert(doc);
  }

  console.log(`Seeded ${docs.length} docs into ${databaseId}/${containerId}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
