const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { log } = require("./logger");

const basePath = process.pkg
  ? path.dirname(process.execPath)
  : __dirname;

const pluginsDir = path.join(basePath, "../plugins");

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

            // Optimization: Compile the script once during loading
            const useSandbox = manifest ? manifest.sandbox !== false : true;
            let compiledScript = null;
            if (useSandbox) {
                compiledScript = new vm.Script(pluginCode, { filename: entry });
            }

            // Define the run function
            const run = (input) => {
                const timeout = manifest ? manifest.timeout || 5000 : 5000;

                if (useSandbox && compiledScript) {
                    const sandbox = {
                        console,
                        input,
                        module: { exports: {} },
                        exports: {},
                        setTimeout,
                        clearTimeout,
                        Buffer,
                        process: {
                            cpuUsage: process.cpuUsage,
                            memoryUsage: process.memoryUsage,
                        }
                    };

                    // Add restricted permissions based on manifest
                    if (manifest && manifest.permissions) {
                        if (manifest.permissions.includes("system")) {
                            sandbox.os = require("os");
                        }
                        if (manifest.permissions.includes("network")) {
                            sandbox.fetch = fetch;
                        }
                    }

                    vm.createContext(sandbox);

                    try {
                        // Execute the pre-compiled script
                        compiledScript.runInContext(sandbox, { timeout });

                        // Look for the exported run function
                        const pluginRun = sandbox.module.exports.run || sandbox.exports.run;
                        if (typeof pluginRun === "function") {
                            return pluginRun(input);
                        } else {
                            throw new Error("No run function exported in plugin");
                        }
                    } catch (e) {
                        log(`Sandbox execution error in ${entry}: ${e.message}`);
                        throw e;
                    }
                } else {
                    // Non-sandboxed execution (only if explicitly allowed in manifest)
                    // We delete from require cache to ensure fresh load if it was changed
                    delete require.cache[require.resolve(pluginPath)];
                    const plugin = require(pluginPath);
                    if (typeof plugin.run === "function") {
                        return plugin.run(input);
                    } else {
                        throw new Error("No run function exported in plugin");
                    }
                }
            };

            plugins.push({
                name: manifest ? manifest.name : entry.replace('.js', ''),
                manifest,
                run
            });

            log(`Plugin carregado: ${manifest ? manifest.name : entry}`);

        } catch (e) {
            log(`Erro ao carregar plugin ${entry}: ${e.message}`);
        }
    });

    return plugins;
}

module.exports = { loadPlugins };
