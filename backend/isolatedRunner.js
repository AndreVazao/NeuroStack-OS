const { fork } = require("child_process");
const path = require("path");

function runIsolated(code, manifest, input) {
  return new Promise((resolve, reject) => {
    const wrapperPath = path.join(__dirname, "pluginWrapper.js");
    const child = fork(wrapperPath);

    child.send({ code, manifest, input });

    const timeout = (manifest.timeout || 3000) + 2000; // Extra buffer for process overhead
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("Plugin execution timeout"));
    }, timeout);

    child.on("message", (msg) => {
      clearTimeout(timer);
      if (msg.status === "success") {
        resolve(msg.result);
      } else {
        reject(new Error(msg.error));
      }
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.on("exit", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`Plugin process exited with code ${code}`));
      }
    });
  });
}

module.exports = { runIsolated };
