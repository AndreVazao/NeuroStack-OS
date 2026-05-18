const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

const nodesFile = path.join(__dirname, "nodes.json");

if (!fs.existsSync(nodesFile)) {
    console.error("❌ nodes.json not found");
    process.exit(1);
}

const nodes = JSON.parse(fs.readFileSync(nodesFile));

function syncToNode(node) {
    if (node.role === "master") return;

    console.log(`🔄 Syncing to ${node.name} (${node.ip})...`);

    exec(`rsync -az /opt/neurostack ${node.ip}:/opt/`, (err) => {
        if (err) console.error(`❌ Error syncing to ${node.name}: ${err.message}`);
        else console.log(`✅ Sync complete: ${node.name}`);
    });
}

console.log("🔗 Starting Multi-node Sync...");
nodes.nodes.forEach(syncToNode);
