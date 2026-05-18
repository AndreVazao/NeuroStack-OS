const fs = require("fs");
const path = require("path");

const basePath = process.pkg
  ? path.dirname(process.execPath)
  : __dirname;

const logFile = path.join(basePath, "system.log");

function log(message) {
    const line = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(logFile, line);
    console.log(line);
}

module.exports = { log };
