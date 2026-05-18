const cluster = require("../backend/cluster/clusterManager");

async function runDistributed() {
    const nodes = cluster.getNodes().filter(n => n.role === "worker");

    for (let node of nodes) {
        console.log("🚀 Enviar tarefa para", node.name);

        await cluster.send(node, "/start/jules", "POST");
    }
}

runDistributed();
