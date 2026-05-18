require('dotenv').config();
const os = require("os");
const path = require("path");

const HOME = os.homedir();

module.exports = {
    API_KEY: process.env.NEUROSTACK_API_KEY || "neurostack-key",
    PORT: process.env.PORT || 3001,

    PATHS: {
        ollama: null,
        jules: path.join(HOME, "projects/jules"),
        godmode: path.join(HOME, "projects/godmode"),
        mad: path.join(HOME, "projects/mad")
    }
};
