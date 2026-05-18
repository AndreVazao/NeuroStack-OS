const express = require("express");
const router = express.Router();
const { generatePlugin } = require("./ai-plugin-generator");
const { loadPlugins } = require("./pluginLoader");

router.post("/generate-plugin", async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
      return res.status(400).json({ error: "Missing name or description" });
  }

  try {
      const result = await generatePlugin(name, description);
      // hot reload is not explicitly implemented in pluginLoader yet but the user requested it
      // loadPlugins() currently returns the list and logs them.
      // server.js would need to update its 'plugins' variable.
      res.json(result);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

module.exports = router;
