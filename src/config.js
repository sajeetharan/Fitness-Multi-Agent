const endpoint = process.env.COSMOS_ENDPOINT || "https://127.0.0.1:8081/";
const key =
  process.env.COSMOS_KEY ||
  "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM5ezCSeA==";

const connectionString = process.env.COSMOS_CONNECTION_STRING || "";
const isEmulator = /127\.0\.0\.1|localhost/.test(endpoint);

if (isEmulator) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

module.exports = {
  endpoint,
  key,
  connectionString,
  clientConfig: connectionString || { endpoint, key },
  databaseId: process.env.COSMOS_DATABASE_ID || "FitnessCoachDb",
  containerId: process.env.COSMOS_CONTAINER_ID || "Memories",
};
