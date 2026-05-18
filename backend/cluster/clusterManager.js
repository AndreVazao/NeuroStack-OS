const fs = require("fs");
const path = require("path");
const { API_KEY } = require("../config");

const basePath = process.pkg
  ? path.dirname(process.execPath)
  : __dirname;

const nodesData = JSON.parse(
    fs.readFileSync(path.join(basePath, "nodes.json"), "utf8")
);
const nodes = nodesData.nodes;

async function send(node, endpoint, method="GET") {
    const url = `http://${node.ip}:3001${endpoint}`;

    try {
        const res = await fetch(url, {
            method,
            headers: { "x-api-key": API_KEY }
        });
        return await res.json();
    } catch (e) {
        return { error: e.toString() };
    }
}

async function broadcast(endpoint, method="GET") {
    return Promise.all(nodes.map(n => send(n, endpoint, method)));
}

function getNodes() {
    return nodes;
}

module.exports = { send, broadcast, getNodes };
