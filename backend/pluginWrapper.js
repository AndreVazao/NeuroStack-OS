const vm = require("vm");
const { createSafeAPI } = require("./sandbox");

process.on("message", async (data) => {
  const { code, manifest, input } = data;

  try {
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

    const result = await runFunc(input, sandbox.API);
    process.send({ status: "success", result });
  } catch (e) {
    process.send({ status: "error", error: e.message });
  } finally {
    process.exit(0);
  }
});
