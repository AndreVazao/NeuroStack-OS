const fs = require("fs");
const path = require("path");
const { log } = require("./logger");

const pluginsDir = path.join(__dirname, "../plugins");

function loadPlugins() {
    const plugins = [];

    if (!fs.existsSync(pluginsDir)) return plugins;

    fs.readdirSync(pluginsDir).forEach(file => {
        try {
            // Only try to load .js files
            if (!file.endsWith('.js')) return;

            const pluginPath = path.join(pluginsDir, file);
            // Clear cache for plugin if it was already loaded
            delete require.cache[require.resolve(pluginPath)];
            const plugin = require(pluginPath);
            plugins.push(plugin);
            log(`Plugin carregado: ${plugin.name || file}`);
        } catch (e) {
            log(`Erro plugin ${file}: ${e}`);
        }
    });

    return plugins;
}

module.exports = { loadPlugins };
