const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { log } = require("./logger");

const basePath = process.pkg
  ? path.dirname(process.execPath)
  : __dirname;

const pluginsDir = path.join(basePath, "../plugins");

function validatePlugin(pluginPath) {
  try {
    // Basic syntax check using node -c
    const indexFile = path.join(pluginPath, "index.js");
    execSync(`node -c "${indexFile}"`, { timeout: 2000 });

    // Attempt a dry run in a separate process to see if it crashes on load
    // We mock a minimal environment and use JSON.stringify for safe paths
    const testScript = `
      try {
        const plugin = require(${JSON.stringify(indexFile)});
        if (typeof plugin.run !== "function") {
          process.exit(1);
        }
        process.exit(0);
      } catch (e) {
        process.exit(1);
      }
    `;
    const testFilePath = path.join(pluginPath, "test_load.js");
    fs.writeFileSync(testFilePath, testScript);

    try {
      execSync(`node "${testFilePath}"`, { timeout: 3000 });
      fs.unlinkSync(testFilePath);
      return true;
    } catch (e) {
      if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
      return false;
    }
  } catch (err) {
    return false;
  }
}

async function generatePlugin(name, description) {
  const pluginDirPath = path.join(pluginsDir, name);

  if (!fs.existsSync(pluginsDir)) {
      fs.mkdirSync(pluginsDir, { recursive: true });
  }

  if (!fs.existsSync(pluginDirPath)) {
      fs.mkdirSync(pluginDirPath, { recursive: true });
  }

  const manifest = {
    name,
    version: "1.0.0",
    description,
    entry: "index.js",
    permissions: ["system"],
    sandbox: true,
    timeout: 5000
  };

  const code = `
/**
 * Plugin: ${name}
 * Description: ${description}
 */
exports.run = async (input) => {
  console.log("Executing ${name}...");
  // Simulated AI generated logic for: ${description}
  return {
    status: "success",
    plugin: "${name}",
    result: "Executed logic for ${description.replace(/"/g, '\\"')}",
    input: input
  };
};
`;

  const indexFilePath = path.join(pluginDirPath, "index.js");
  const manifestFilePath = path.join(pluginDirPath, "manifest.json");

  fs.writeFileSync(indexFilePath, code);
  fs.writeFileSync(manifestFilePath, JSON.stringify(manifest, null, 2));

  log(`Validating generated plugin: ${name}`);

  if (validatePlugin(pluginDirPath)) {
    log(`Plugin ${name} validated successfully.`);
    return { status: "created", plugin: name };
  } else {
    log(`Plugin ${name} failed validation. Cleaning up.`);
    if (fs.existsSync(indexFilePath)) fs.unlinkSync(indexFilePath);
    if (fs.existsSync(manifestFilePath)) fs.unlinkSync(manifestFilePath);
    if (fs.existsSync(pluginDirPath)) {
        try {
            fs.rmdirSync(pluginDirPath);
        } catch (e) {}
    }
    return { status: "failed", error: "Plugin validation failed" };
  }
}

module.exports = { generatePlugin };
