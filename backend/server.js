const express = require("express");
const cors = require("cors");
const os = require("os");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const API_KEY = "neurostack-key";

let services = {};
let plugins = [];

// Middleware security
app.use((req, res, next) => {
    if (req.headers["x-api-key"] !== API_KEY) {
        return res.status(403).send("Forbidden");
    }
    next();
});

// Plugin loader
function loadPlugins() {
    const pluginsDir = path.join(__dirname, "../plugins");
    if (!fs.existsSync(pluginsDir)) return;

    const files = fs.readdirSync(pluginsDir);
    plugins = files.filter(f => f.endsWith(".js")).map(f => {
        try {
            const plugin = require(path.join(pluginsDir, f));
            if (typeof plugin.run === "function") plugin.run();
            return { name: plugin.name || f, status: "loaded" };
        } catch (e) {
            return { name: f, status: "error", error: e.message };
        }
    });
}

// STATUS
app.get("/status", (req, res) => {
    res.json({
        ram: os.freemem(),
        total_ram: os.totalmem(),
        cpu: os.loadavg(),
        services,
        plugins,
        uptime: os.uptime()
    });
});

// START SERVICE
app.post("/start/:name", (req, res) => {
    const name = req.params.name;
    const commands = {
        ollama: "ollama serve &",
        jules: "cd ~/projects/jules && python3 main.py &",
        godmode: "godmode &",
        mad: "mad &"
    };

    if (commands[name]) {
        exec(commands[name]);
        services[name] = true;
        res.json({ ok: true, message: `Service ${name} started` });
    } else {
        res.status(404).json({ ok: false, message: "Service not found" });
    }
});

// STOP SERVICE
app.post("/stop/:name", (req, res) => {
    const name = req.params.name;
    exec(`pkill -f ${name}`);
    services[name] = false;
    res.json({ ok: true, message: `Service ${name} stopped` });
});

// AGENT RUN
app.post("/agent/run", (req, res) => {
    exec("node ../agents/orchestrator.js &");
    res.json({ ok: true, message: "Agent loop triggered" });
});

app.listen(PORT, "0.0.0.0", () => {
    loadPlugins();
    console.log(`🔥 NeuroStack Backend running on port ${PORT}`);
});
