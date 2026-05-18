const { spawn, execSync } = require("child_process");
const { log } = require("./logger");

const processes = {};

function isRunning(name) {
    try {
        // Use exact match to avoid false positives
        execSync(`pgrep -x -f "${name}"`);
        return true;
    } catch {
        return false;
    }
}

function start(name, cmd, args = [], cwd = null) {
    try {
        if (isRunning(name)) {
            log(`${name} já está a correr`);
            return;
        }

        const proc = spawn(cmd, args, {
            cwd,
            detached: true,
            stdio: "ignore"
        });

        proc.on('error', (err) => {
            log(`ERRO ao iniciar ${name}: ${err.message}`);
        });

        proc.unref();
        processes[name] = proc.pid;

        log(`START ${name} PID=${proc.pid}`);
    } catch (e) {
        log(`ERRO CRÍTICO START ${name}: ${e.message}`);
    }
}

function stop(name) {
    try {
        if (!isRunning(name)) {
            log(`${name} não está ativo`);
            return;
        }

        execSync(`pkill -x -f "${name}"`);
        delete processes[name];
        log(`STOP ${name}`);
    } catch (e) {
        log(`ERRO STOP ${name}: ${e.message}`);
    }
}

function status(name) {
    try {
        return isRunning(name);
    } catch (e) {
        log(`ERRO ao verificar status de ${name}: ${e.message}`);
        return false;
    }
}

module.exports = { start, stop, status };
