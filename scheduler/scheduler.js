const os = require("os");
const { execSync } = require("child_process");

const MEM_THRESHOLD_PERCENT = 10; // Stop services if free RAM < 10%
const CHECK_INTERVAL = 30000; // 30 seconds

console.log("⏱ NeuroStack Scheduler started");

function isRunning(name) {
    try {
        execSync(`pgrep -f ${name}`);
        return true;
    } catch {
        return false;
    }
}

function killService(name) {
    if (isRunning(name)) {
        console.warn(`⚠️ [Scheduler] Killing ${name} due to low memory`);
        try {
            execSync(`pkill -f ${name}`);
        } catch (e) {
            console.error(`Failed to kill ${name}: ${e}`);
        }
    }
}

function monitor() {
    const free = os.freemem();
    const total = os.totalmem();
    const freePercent = (free / total) * 100;

    console.log(`[Scheduler] RAM Free: ${Math.round(freePercent)}%`);

    if (freePercent < MEM_THRESHOLD_PERCENT) {
        console.warn("⚠️ LOW MEMORY! Emergency service shutdown initiated.");

        // Priority list of services to kill
        killService("ollama");
        killService("jules");
        killService("python");

        console.log("🛑 High-memory services checked/killed to preserve system stability.");
    }
}

setInterval(monitor, CHECK_INTERVAL);
