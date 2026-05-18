const os = require("os");
const { exec } = require("child_process");

const MEM_THRESHOLD_PERCENT = 10; // Stop services if free RAM < 10%
const CHECK_INTERVAL = 30000; // 30 seconds

console.log("⏱ NeuroStack Scheduler started");

function monitor() {
    const free = os.freemem();
    const total = os.totalmem();
    const freePercent = (free / total) * 100;

    console.log(`[Scheduler] RAM Free: ${Math.round(freePercent)}%`);

    if (freePercent < MEM_THRESHOLD_PERCENT) {
        console.warn("⚠️ LOW MEMORY! Emergency service shutdown initiated.");
        // Emergency stop high-memory services
        exec("pkill -f ollama");
        exec("pkill -f jules");
        console.log("🛑 Services killed to preserve system stability.");
    }
}

setInterval(monitor, CHECK_INTERVAL);
