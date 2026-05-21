# Fitness Multi-Agent Demo

AI fitness multi-agent app with persistent memory on Azure Cosmos DB — demo for [Azure Cosmos DB Agent Kit](https://github.com/AzureCosmosDB/cosmosdb-agent-kit).

## Overview

This app simulates the memory layer of a multi-agent fitness coaching system. Multiple agents (workout planner, nutrition tracker, recovery monitor) share persistent memory through a single Cosmos DB container, partitioned by `memberId`.

Memory types stored:
- **Procedural** — learned routines (e.g., "prefers fasted morning runs")
- **Episodic** — specific events (e.g., "week 2 bench press progress")
- **Declarative** — facts and preferences (e.g., "high protein diet")

## The Demo

The app ships with an intentionally broken service (`alertsService.bad.js`) that demonstrates common Cosmos DB anti-patterns:

| Anti-pattern | Impact |
|---|---|
| New client every request | Connection overhead on each call |
| `SELECT *` | Excessive RU cost, unnecessary data transfer |
| String interpolation | Injection risk, no query plan caching |
| Missing partition key filter | Cross-partition fan-out, data leakage across members |

The reference implementation (`alertsService.reference.js`) shows the corrected version after Agent Kit review.

## Quick Start

### Prerequisites

- Node.js 18+
- [Azure Cosmos DB Emulator](https://learn.microsoft.com/en-us/azure/cosmos-db/emulator) or a Cosmos DB account

### Setup

```bash
npm install
```

### Seed the database

```bash
# Using the emulator (default)
npm run seed

# Using a Cosmos DB account
COSMOS_CONNECTION_STRING="your-connection-string" npm run seed
```

### Run the broken version

```bash
npm start
```

Open: http://localhost:3100/api/memory/review?memberId=scott&planId=summer-cut-2026&memoryType=procedural

Notice: results include memories from other members (data leak).

### Run the fixed version

```bash
npm run start:reference
```

Same URL — now returns only Scott's procedural memories. No fan-out, no leakage.

## Project Structure

```
├── data/
│   └── fitness-memories.json   # Seed data (procedural, episodic, declarative)
├── scripts/
│   └── seed-emulator.js        # Seeds Cosmos DB with sample memories
├── src/
│   ├── app.js                  # Express server
│   ├── config.js               # Cosmos DB connection config
│   ├── cosmosClient.js         # Singleton client
│   └── services/
│       ├── alertsService.bad.js       # Intentionally broken (demo target)
│       └── alertsService.reference.js # Corrected after Agent Kit review
└── package.json
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `COSMOS_CONNECTION_STRING` | — | Full connection string (preferred) |
| `COSMOS_ENDPOINT` | `https://127.0.0.1:8081/` | Emulator endpoint |
| `COSMOS_KEY` | Emulator default key | Account key |
| `COSMOS_DATABASE_ID` | `FitnessCoachDb` | Database name |
| `COSMOS_CONTAINER_ID` | `Memories` | Container name |
| `PORT` | `3100` | Server port |

## Related

- [Azure Cosmos DB Agent Kit](https://github.com/AzureCosmosDB/cosmosdb-agent-kit) — the skill set that catches these issues
- [Travel Multi-Agent Workshop](https://github.com/AzureCosmosDB/travel-multi-agent-workshop) — same memory architecture pattern for a travel planning app
