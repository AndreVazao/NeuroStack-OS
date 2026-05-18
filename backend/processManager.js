const { spawn, execSync } = require("child_process");
const { log } = require("./logger");

const processes = {};

function isRunning(name) {
    try {
        execSync(`pgrep -f ${name}`);
        return true;
    } catch {
        return false;
    }
}

function start(name, cmd, args = [], cwd = null) {
    if (isRunning(name)) {
        log(`${name} já está a correr`);
        return;
    }

    const proc = spawn(cmd, args, {
        cwd,
        detached: true,
        stdio: "ignore"
    });

    proc.unref();
    processes[name] = proc.pid;

    log(`START ${name} PID=${proc.pid}`);
}

function stop(name) {
    if (!isRunning(name)) {
        log(`${name} não está ativo`);
        return;
    }

    try {
        execSync(`pkill -f ${name}`);
        delete processes[name];
        log(`STOP ${name}`);
    } catch (e) {
        log(`ERRO STOP ${name}: ${e}`);
    }
}

function status(name) {
    return isRunning(name);
}

module.exports = { start, stop, status };
