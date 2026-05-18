// roadmap-converter.js
const fs = require("fs");

function roadmapToTasks() {
  if (!fs.existsSync("./roadmap.json")) {
    console.warn("roadmap.json not found.");
    return;
  }

  const roadmap = JSON.parse(fs.readFileSync("./roadmap.json"));

  global.taskQueue = global.taskQueue || [];

  roadmap.roadmap.forEach(item => {
    // Avoid duplicates
    if (!global.taskQueue.find(t => t.title === item.title)) {
        global.taskQueue.push({
            type: item.type,
            title: item.title,
            priority: item.priority,
            status: "queued",
            id: Date.now() + Math.random().toString(36).substr(2, 9)
        });
    }
  });
}

module.exports = { roadmapToTasks };
