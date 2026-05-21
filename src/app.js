const express = require("express");
const { databaseId, containerId, endpoint } = require("./config");

const alertsService = process.env.USE_REFERENCE_SERVICE === "1"
  ? require("./services/alertsService.reference")
  : require("./services/alertsService.bad");

const app = express();
const port = Number(process.env.PORT || 3100);

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
    const result = await alertsService.getTripMemoryReview({
      memberId: req.query.memberId,
      planId: req.query.planId,
      memoryType: req.query.memoryType,
      limit: req.query.limit,
    });

    res.json({
      mode: process.env.USE_REFERENCE_SERVICE === "1" ? "reference" : "bad",
      result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`AI Fitness Multi-Agent demo listening on http://localhost:${port}`);
  console.log(`Mode: ${process.env.USE_REFERENCE_SERVICE === "1" ? "reference" : "bad"}`);
});
