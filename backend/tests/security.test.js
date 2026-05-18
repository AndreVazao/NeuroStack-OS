const { runIsolated } = require("../isolatedRunner");
const { PERMISSIONS } = require("../permissions");

describe("Security Sandbox (Isolated)", () => {
  test("Plugin should execute and return result", async () => {
    const code = `
      exports.run = async (input, API) => {
        return { message: "Hello " + input.name };
      };
    `;
    const manifest = { permissions: [], timeout: 1000 };
    const result = await runIsolated(code, manifest, { name: "Jules" });
    expect(result.message).toBe("Hello Jules");
  });

  test("Plugin should be denied access to system info without permission", async () => {
    const code = `
      exports.run = async (input, API) => {
        return API.system.info();
      };
    `;
    const manifest = { permissions: [], timeout: 1000 };
    await expect(runIsolated(code, manifest, {})).rejects.toThrow("Permission denied: system");
  });

  test("Plugin should have access to system info with permission", async () => {
    const code = `
      exports.run = async (input, API) => {
        return API.system.info();
      };
    `;
    const manifest = { permissions: [PERMISSIONS.SYSTEM], timeout: 1000 };
    const result = await runIsolated(code, manifest, {});
    expect(result).toHaveProperty("memory");
  });

  test("Plugin should NOT have access to require, process, or eval", async () => {
    const code = `
      exports.run = async (input, API) => {
        return {
          hasProcess: typeof process !== 'undefined' && process !== null,
          hasRequire: typeof require !== 'undefined' && require !== null,
          hasEval: typeof eval !== 'undefined' && eval !== null
        };
      };
    `;
    const manifest = { permissions: [], timeout: 1000 };
    const result = await runIsolated(code, manifest, {});
    expect(result.hasProcess).toBe(false);
    expect(result.hasRequire).toBe(false);
    // eval is a bit tricky in some JS environments but our sandbox should block it
    expect(result.hasEval).toBe(false);
  });
});
