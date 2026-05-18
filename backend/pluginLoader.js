const fs = require("fs");
const path = require("path");
const { log } = require("./logger");
const { runIsolated } = require("./isolatedRunner");
const { getTrustScore } = require("./plugin-rating");

const basePath = process.pkg
  ? path.dirname(process.execPath)
  : __dirname;

const pluginsDir = path.join(basePath, "../plugins");

// For observability
global.rejectedPlugins = global.rejectedPlugins || [];

function loadPlugins() {
    const plugins = [];

    if (!fs.existsSync(pluginsDir)) return plugins;

    const entries = fs.readdirSync(pluginsDir);

    entries.forEach(entry => {
        const entryPath = path.join(pluginsDir, entry);
        let manifest = null;
        let pluginCode = null;
        let pluginPath = "";

        try {
            if (fs.lstatSync(entryPath).isDirectory()) {
                const manifestPath = path.join(entryPath, "manifest.json");
                if (fs.existsSync(manifestPath)) {
                    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
                    const mainFile = manifest.entry || "index.js";
                    pluginPath = path.join(entryPath, mainFile);
                } else {
                    pluginPath = path.join(entryPath, "index.js");
                }
            } else if (entry.endsWith('.js')) {
                pluginPath = entryPath;
            } else {
                return;
            }

            if (!fs.existsSync(pluginPath)) return;

            pluginCode = fs.readFileSync(pluginPath, "utf8");

            const pluginName = manifest ? manifest.name : entry.replace('.js', '');

            const run = async (input) => {
                const trustScore = getTrustScore(pluginName);
                if (trustScore < 50 && trustScore !== 0) {
                    log(`Warning: Running low trust plugin: ${pluginName}`);
                }

                return runIsolated(pluginCode, manifest || {}, input);
            };

            plugins.push({
                name: pluginName,
                manifest,
                run
            });

            log(`Plugin carregado: ${pluginName}`);

        } catch (e) {
            log(`Erro ao carregar plugin ${entry}: ${e.message}`);
            global.rejectedPlugins.push({ name: entry, error: e.message, timestamp: new Date() });
        }
    });

    return plugins;
}

module.exports = { loadPlugins };
