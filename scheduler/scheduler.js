require('dotenv').config();
const os = require("os");
const { execSync } = require("child_process");

const MEM_THRESHOLD_PERCENT = process.env.MEM_THRESHOLD_PERCENT || 10;
const CHECK_INTERVAL = process.env.CHECK_INTERVAL || 30000;

console.log("⏱ NeuroStack Scheduler started");
console.log(`Threshold: ${MEM_THRESHOLD_PERCENT}%, Interval: ${CHECK_INTERVAL}ms`);

function isRunning(name) {
    try {
        // Use exact match to avoid killing substrings or the scheduler itself
        execSync(`pgrep -x -f "${name}"`);
        return true;
    } catch {
        return false;
    }
}

function killService(name) {
    if (isRunning(name)) {
        console.warn(`⚠️ [Scheduler] Killing ${name} due to low memory`);
        try {
            execSync(`pkill -x -f "${name}"`);
        } catch (e) {
            console.error(`Failed to kill ${name}: ${e.message}`);
        }
    }
}

function monitor() {
    try {
        const free = os.freemem();
        const total = os.totalmem();
        const freePercent = (free / total) * 100;

        console.log(`[Scheduler] RAM Free: ${Math.round(freePercent)}%`);

        if (freePercent < MEM_THRESHOLD_PERCENT) {
            console.warn("⚠️ LOW MEMORY! Emergency service shutdown initiated.");

            // Priority list of services to kill - matching serviceRegistry names
            killService("ollama");
            killService("jules");

            // Only kill generic python if jules didn't die or if it's separate
            // Be careful not to kill system critical stuff
            // killService("python3");

            console.log("🛑 High-memory services checked/killed to preserve system stability.");
        }
    } catch (err) {
        console.error(`[Scheduler] Monitor error: ${err.message}`);
    }
}

setInterval(monitor, CHECK_INTERVAL);
