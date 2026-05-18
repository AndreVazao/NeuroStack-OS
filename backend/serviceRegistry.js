const { PATHS } = require("./config");

module.exports = {
    ollama: {
        name: "ollama",
        cmd: "ollama",
        args: ["serve"],
        cwd: null
    },

    jules: {
        name: "jules",
        cmd: "python3",
        args: ["main.py"],
        cwd: PATHS.jules
    },

    godmode: {
        name: "godmode",
        cmd: "npm",
        args: ["start"],
        cwd: PATHS.godmode
    },

    mad: {
        name: "mad",
        cmd: "docker-compose",
        args: ["up", "-d"],
        cwd: PATHS.mad
    }
};
