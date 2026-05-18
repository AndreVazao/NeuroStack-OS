const express = require("express");
const cors = require("cors");
const os = require("os");

const { API_KEY, PORT } = require("./config");
const { start, stop, status } = require("./processManager");
const services = require("./serviceRegistry");
const { loadPlugins } = require("./pluginLoader");
const { log } = require("./logger");
const cluster = require("./cluster/clusterManager");

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 AUTH
app.use((req, res, next) => {
    if (req.headers["x-api-key"] !== API_KEY) {
        return res.status(403).send("Forbidden");
    }
    next();
});

// 🔌 LOAD PLUGINS
const plugins = loadPlugins();

// 📊 STATUS GLOBAL
app.get("/status", (req, res) => {
    const state = {};

    for (let key in services) {
        state[key] = status(key);
    }

    res.json({
        ram_free: Math.round(os.freemem() / 1024 / 1024),
        cpu: os.loadavg(),
        services: state,
        plugins: plugins.map(p => ({ name: p.name || "unknown", status: "loaded" }))
    });
});

// ▶️ START
app.post("/start/:name", (req, res) => {
    const name = req.params.name;
    const svc = services[name];

    if (!svc) return res.status(404).send("Not found");

    start(svc.name, svc.cmd, svc.args, svc.cwd);
    res.json({ ok: true });
});

// ⏹ STOP
app.post("/stop/:name", (req, res) => {
    stop(req.params.name);
    res.json({ ok: true });
});

// ❤️ HEALTH
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        uptime: process.uptime()
    });
});

// 🔌 RUN PLUGIN
app.post("/plugin/:name", (req, res) => {
    const p = plugins.find(pl => pl.name === req.params.name);
    if (!p) return res.status(404).send("Plugin not found");

    try {
        p.run();
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: e.toString() });
    }
});

// --- CLUSTER ENDPOINTS ---

// LISTAR NÓS
app.get("/cluster/nodes", (req, res) => {
    res.json(cluster.getNodes());
});

// STATUS DE TODOS
app.get("/cluster/status", async (req, res) => {
    const data = await cluster.broadcast("/status");
    res.json(data);
});

// START REMOTO
app.post("/cluster/start/:service/:node", async (req, res) => {
    const { service, node } = req.params;

    const n = cluster.getNodes().find(x => x.name === node);
    if (!n) return res.status(404).send("Node not found");

    const r = await cluster.send(n, `/start/${service}`, "POST");
    res.json(r);
});

// STOP REMOTO
app.post("/cluster/stop/:service/:node", async (req, res) => {
    const { service, node } = req.params;

    const n = cluster.getNodes().find(x => x.name === node);
    if (!n) return res.status(404).send("Node not found");

    const r = await cluster.send(n, `/stop/${service}`, "POST");
    res.json(r);
});

app.listen(PORT, "0.0.0.0", () => {
    log(`🔥 NeuroStack Backend running on ${PORT}`);
});
