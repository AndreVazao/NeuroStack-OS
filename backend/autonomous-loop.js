// autonomous-loop.js
const fs = require("fs");
const path = require("path");
const { generateRoadmap } = require("./ai-cto");
const { roadmapToTasks } = require("./roadmap-converter");
const { executeTask } = require("./intelligent-executor");

const AUDIT_LOG = path.join(__dirname, "audit.log");
const MAX_TASKS_PER_CYCLE = 5;
const ALLOWED_TASK_TYPES = ["feature", "bug", "optimize"];

function auditLog(entry) {
    const line = `[${new Date().toISOString()}] ${JSON.stringify(entry)}\n`;
    fs.appendFileSync(AUDIT_LOG, line);
}

async function autonomousLoop() {
  console.log("--- Starting Autonomous Loop ---");
  auditLog({ action: "loop_start", status: "started" });

  try {
    const roadmap = await generateRoadmap();
    roadmapToTasks();

    if (global.taskQueue) {
        let tasksProcessed = 0;
        for (const task of global.taskQueue) {
          if (tasksProcessed >= MAX_TASKS_PER_CYCLE) {
            console.log("Max tasks per cycle reached.");
            auditLog({ action: "limit_reached", limit: MAX_TASKS_PER_CYCLE });
            break;
          }

          if (task.status === "queued") {
            if (!ALLOWED_TASK_TYPES.includes(task.type)) {
                console.warn(`Task type ${task.type} not allowed. Skipping.`);
                task.status = "rejected";
                auditLog({ action: "task_rejected", task: task.title, reason: "type_not_allowed" });
                continue;
            }

            auditLog({ action: "task_execution_start", task: task.title });
            await executeTask(task);
            auditLog({ action: "task_execution_end", task: task.title, status: task.status });
            tasksProcessed++;
          }
        }
    }
    auditLog({ action: "loop_end", status: "completed" });
  } catch (e) {
      console.error("Autonomous loop error:", e.message);
      auditLog({ action: "loop_error", error: e.message });
  }
}

function startAutonomousLoop(intervalMs = 60000) {
    // Initial run
    autonomousLoop();
    setInterval(autonomousLoop, intervalMs);
}

module.exports = { autonomousLoop, startAutonomousLoop };
