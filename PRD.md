# Product Requirements Document (PRD)

## Fitness Multi-Agent Memory Service

**Version:** 1.0  
**Date:** May 2026  
**Status:** Demo / Reference Implementation

---

## 1. Purpose

Demonstrate how multiple AI fitness-coaching agents (workout planner, nutrition tracker, recovery monitor) can share persistent memory through Azure Cosmos DB, using the [Azure Cosmos DB Agent Kit](https://github.com/AzureCosmosDB/cosmosdb-agent-kit). The app also serves as a teaching tool to contrast common Cosmos DB anti-patterns against production-ready best practices.

## 2. Target Audience

- Developers evaluating Azure Cosmos DB for multi-agent AI systems
- Teams learning Cosmos DB query best practices (parameterization, partition key usage, projection)
- Presenters delivering Azure Friday or conference demos

## 3. Problem Statement

Multi-agent AI systems require a shared, durable memory layer that is:

1. **Partitioned per user** — agents must only access the current member's data.
2. **Efficient** — queries should avoid cross-partition fan-out and excessive RU consumption.
3. **Secure** — no data leakage between members; no injection vulnerabilities.

Without proper Cosmos DB patterns, applications introduce silent data leaks, inflated costs, and security risks.

## 4. Core Concepts

| Concept | Description |
|---------|-------------|
| **Member** | A gym member whose fitness data is stored (partition key: `memberId`) |
| **Plan** | A named fitness plan (e.g., `summer-cut-2026`) grouping related memories |
| **Memory Type** | Category of memory: `procedural`, `episodic`, or `declarative` |
| **Agent Memory** | A single record containing a title, summary, priority, and timestamp |

## 5. Functional Requirements

### 5.1 Memory Review API

| ID | Requirement |
|----|-------------|
| FR-1 | Expose `GET /api/memory/review` that returns memories filtered by `memberId`, `planId`, and `memoryType`. |
| FR-2 | Support a `limit` query parameter (default 20, max 50) to cap result size. |
| FR-3 | Return results ordered by `priority DESC`, then `createdAtUtc DESC`. |
| FR-4 | Include `requestCharge` (RU cost) in the response for observability. |
| FR-5 | Reject requests missing required parameters (`memberId`, `planId`, `memoryType`) with HTTP 400. |

### 5.2 Data Seeding

| ID | Requirement |
|----|-------------|
| FR-6 | Provide a seed script that populates the Cosmos DB emulator (or live account) with sample fitness memories for multiple members. |
| FR-7 | Seed data must include all three memory types across at least two members. |

### 5.3 Dual-Mode Execution

| ID | Requirement |
|----|-------------|
| FR-8 | App runs in **"bad" mode** by default, demonstrating anti-patterns. |
| FR-9 | App runs in **"reference" mode** when `USE_REFERENCE_SERVICE=1`, demonstrating correct patterns. |
| FR-10 | The root endpoint (`GET /`) reports the active mode, database, and container info. |

## 6. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | **Security** — Reference service must use parameterized queries to prevent injection. |
| NFR-2 | **Isolation** — Reference service must filter on partition key (`memberId`) to prevent cross-member data leakage. |
| NFR-3 | **Performance** — Reference service must project only needed fields (no `SELECT *`). |
| NFR-4 | **Connection efficiency** — Use a singleton Cosmos DB client; never instantiate per request. |
| NFR-5 | **Portability** — Run against the local Cosmos DB Emulator or a cloud account via environment variable. |

## 7. Anti-Pattern Catalog (Educational)

The "bad" service intentionally violates the non-functional requirements above:

| Anti-Pattern | NFR Violated | Observable Impact |
|---|---|---|
| New `CosmosClient` per request | NFR-4 | High latency, connection churn |
| `SELECT *` without projection | NFR-3 | Inflated RU cost, excess data transfer |
| String interpolation in queries | NFR-1 | Injection vulnerability, no plan caching |
| Missing partition key filter | NFR-2 | Cross-partition fan-out, data leakage |

## 8. Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express 4.x |
| Database | Azure Cosmos DB (NoSQL API) |
| SDK | `@azure/cosmos` ^4.3 |

## 9. API Specification

### `GET /`

Returns service info and active mode.

### `GET /api/memory/review`

**Query Parameters:**

| Param | Required | Description |
|-------|----------|-------------|
| `memberId` | Yes | Partition key — the gym member's ID |
| `planId` | Yes | Fitness plan identifier |
| `memoryType` | Yes | One of `procedural`, `episodic`, `declarative` |
| `limit` | No | Max results (1–50, default 20) |

**Success Response (200):**

```json
{
  "mode": "reference",
  "result": {
    "memberId": "scott",
    "planId": "summer-cut-2026",
    "memoryType": "procedural",
    "count": 2,
    "requestCharge": 2.85,
    "memories": [ ... ],
    "recommendation": "..."
  }
}
```

**Error Response (400):**

```json
{ "message": "memberId is required" }
```

## 10. Success Criteria

1. Running in reference mode returns **only** the requested member's memories — zero data leakage.
2. RU cost in reference mode is measurably lower than bad mode for the same query.
3. Audience can visually compare bad vs. reference responses to understand each anti-pattern's impact.

## 11. Future Considerations

- Add write endpoints for agents to persist new memories.
- Integrate vector search for semantic memory retrieval.
- Add a UI dashboard comparing RU costs between modes in real time.
- Expand agent types (sleep tracker, mental wellness coach).
