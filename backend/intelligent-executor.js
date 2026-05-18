// intelligent-executor.js
const { generatePlugin } = require("./ai-plugin-generator");
// Note: self-refactor is mentioned in snippet but not provided, using a placeholder
async function analyzeAndRefactor(filePath) {
    console.log(`Simulating refactoring of ${filePath}...`);
    return true;
}

async function executeTask(task) {
  console.log("Executing:", task.title);
  task.status = "executing";

  try {
    if (task.type === "feature") {
        // Sanitize name for plugin folder
        const pluginName = task.title.toLowerCase().replace(/\s/g, "-");
        await generatePlugin(pluginName, task.title);
    }

    if (task.type === "optimize") {
        await analyzeAndRefactor("server.js");
    }

    if (task.type === "bug") {
        await analyzeAndRefactor("server.js");
    }

    task.status = "completed";
  } catch (e) {
      console.error(`Failed to execute task ${task.title}:`, e.message);
      task.status = "failed";
      task.error = e.message;
  }
}

module.exports = { executeTask };
