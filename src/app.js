const express = require("express");
const path = require("path");
const { databaseId, containerId, endpoint } = require("./config");

const alertsService = process.env.USE_REFERENCE_SERVICE === "1"
  ? require("./services/alertsService.reference")
  : require("./services/alertsService.bad");

const app = express();
const port = Number(process.env.PORT || 3100);

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files from root folder
app.use(express.static(path.join(__dirname, "..")));

app.get("/", (_req, res) => {
  res.json({
    name: "Azure Friday AI Fitness Multi-Agent Demo",
    mode: process.env.USE_REFERENCE_SERVICE === "1" ? "reference" : "bad",
    endpoint,
    databaseId,
    containerId,
    try: "/api/memory/review?memberId=scott&planId=summer-cut-2026&memoryType=procedural",
  });
});

app.get("/api/memory/review", async (req, res) => {
  try {
    const { memberId, planId, memoryType, limit } = req.query;

    if (!memberId) {
      return res.status(400).json({ message: "memberId is required" });
    }
    if (!planId) {
      return res.status(400).json({ message: "planId is required" });
    }
    if (!memoryType) {
      return res.status(400).json({ message: "memoryType is required" });
    }

    const result = await alertsService.getTripMemoryReview({
      memberId,
      planId,
      memoryType,
      limit: limit ? parseInt(limit) : 20,
    });

    res.json({
      mode: process.env.USE_REFERENCE_SERVICE === "1" ? "reference" : "bad",
      memberId,
      planId,
      memoryType,
      results: result.memories || result.resources || [],
      count: result.count,
      requestCharge: result.requestCharge || 0,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`AI Fitness Multi-Agent demo listening on http://localhost:${port}`);
  console.log(`Mode: ${process.env.USE_REFERENCE_SERVICE === "1" ? "reference" : "bad"}`);
  console.log(`Visit: http://localhost:${port}/demo.html`);
});
