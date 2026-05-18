// backend/sandbox.js
const vm = require("vm");
const fs = require("fs");
const axios = require("axios");

function createSafeAPI(permissions = []) {
  return {
    fs: {
      read: (path) => {
        if (!permissions.includes("fs.read")) throw new Error("Permission denied: fs.read");
        return fs.readFileSync(path, "utf-8");
      },
      write: (path, data) => {
        if (!permissions.includes("fs.write")) throw new Error("Permission denied: fs.write");
        return fs.writeFileSync(path, data);
      }
    },
    net: {
      get: async (url) => {
        if (!permissions.includes("network")) throw new Error("Permission denied: network");
        return (await axios.get(url)).data;
      },
      post: async (url, data) => {
        if (!permissions.includes("network")) throw new Error("Permission denied: network");
        return (await axios.post(url, data)).data;
      }
    },
    system: {
      info: () => {
        if (!permissions.includes("system")) throw new Error("Permission denied: system");
        return {
          memory: process.memoryUsage(),
          uptime: process.uptime(),
          platform: process.platform
        };
      }
    }
  };
}

// Note: runPlugin is now mostly replaced by isolatedRunner but kept for legacy/unit tests
function runPlugin(code, manifest, input) {
  const sandbox = {
    module: { exports: {} },
    exports: {},
    input,
    API: createSafeAPI(manifest.permissions || []),
    console,
    setTimeout,
    clearTimeout,
    Buffer,
    // Strictly remove dangerous globals
    process: undefined,
    require: undefined,
    eval: undefined
  };

  vm.createContext(sandbox);

  const script = new vm.Script(code);
  script.runInContext(sandbox, {
    timeout: manifest.timeout || 3000
  });

  const runFunc = sandbox.module.exports.run || sandbox.exports.run;
  if (typeof runFunc !== "function") {
    throw new Error("Plugin does not export a run function");
  }

  return runFunc(input, sandbox.API);
}

module.exports = { runPlugin, createSafeAPI };
