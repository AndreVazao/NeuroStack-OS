const express = require("express");
const router = express.Router();
const cluster = require("./cluster/clusterManager");
const { loadPlugins } = require("./pluginLoader");

// Global state shared across modules
global.taskQueue = global.taskQueue || [];
global.nodeProcesses = global.nodeProcesses || {};

router.get("/nodes", (req, res) => {
  const data = [];
  const nodes = cluster.getNodes();

  nodes.forEach(n => {
    data.push({
        id: n.name,
        ip: n.ip,
        cpu: "Unknown",
        load: "Unknown"
    });
  });

  res.json(data);
});

router.get("/tasks", (req, res) => {
  res.json(global.taskQueue);
});

router.post("/task", (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).json({ error: "Missing task" });

  global.taskQueue.push({
      id: Date.now().toString(),
      data: task,
      status: "queued",
      timestamp: new Date().toISOString()
  });

  res.json({ status: "queued" });
});

router.post("/plugin/run", async (req, res) => {
  const { name, payload } = req.body;
  if (!name) return res.status(400).json({ error: "Missing plugin name" });

  try {
    const plugins = loadPlugins();
    const plugin = plugins.find(p => p.name === name);

    if (!plugin) {
      return res.status(404).json({ error: "Plugin not found" });
    }

    const result = await plugin.run(payload);
    res.json({ status: "executed", result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/node/:id/kill", (req, res) => {
  const id = req.params.id;

  if (global.nodeProcesses[id]) {
    try {
        process.kill(global.nodeProcesses[id]);
        delete global.nodeProcesses[id];
        res.json({ status: "killed local process" });
    } catch (e) {
        res.status(500).json({ error: "Failed to kill process: " + e.message });
    }
  } else {
    res.json({ status: "kill command received for " + id });
  }
});

module.exports = router;
