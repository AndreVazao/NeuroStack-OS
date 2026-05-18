const os = require("os");
const path = require("path");

const HOME = os.homedir();

module.exports = {
    API_KEY: "neurostack-key",
    PORT: 3001,

    PATHS: {
        ollama: null,
        jules: path.join(HOME, "projects/jules"),
        godmode: path.join(HOME, "projects/godmode"),
        mad: path.join(HOME, "projects/mad")
    }
};
