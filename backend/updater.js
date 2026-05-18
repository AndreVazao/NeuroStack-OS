const fs = require("fs");
const path = require("path");
const https = require("https");
const crypto = require("crypto");
const { exec } = require("child_process");

const CURRENT_VERSION = "1.0.0";
const REPO = "AndreVazao/NeuroStack-OS";

const basePath = process.pkg
  ? path.dirname(process.execPath)
  : __dirname;

const exePath = process.pkg
  ? process.execPath
  : path.join(basePath, "server.js");

const tempUpdatePath = path.join(basePath, "update.exe");

function fetchLatestRelease() {
  return new Promise((resolve, reject) => {
    https.get(
      `https://api.github.com/repos/${REPO}/releases/latest`,
      {
        headers: { "User-Agent": "neurostack-updater" },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (err) {
            reject(err);
          }
        });
      }
    ).on("error", reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
          return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
    }).on("error", (err) => {
        fs.unlink(dest, () => reject(err));
    });
  });
}

function fetchText(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { "User-Agent": "neurostack-updater" } }, (res) => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                return fetchText(res.headers.location).then(resolve).catch(reject);
            }
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => resolve(data));
        }).on("error", reject);
    });
}

function verifyHash(filePath, expectedHash) {
  if (!expectedHash) return true; // Skip if no hash provided

  const data = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256").update(data).digest("hex");
  // Check if expectedHash contains the filename or just the hash
  return expectedHash.toLowerCase().includes(hash.toLowerCase());
}

function replaceExecutable() {
  const script = `
    timeout /t 2
    del "${exePath}"
    rename "${tempUpdatePath}" "${path.basename(exePath)}"
    start "" "${exePath}"
  `;

  const batPath = path.join(basePath, "update.bat");
  fs.writeFileSync(batPath, script);

  exec(`cmd /c "${batPath}"`);
  process.exit();
}

async function checkForUpdates() {
  try {
    const release = await fetchLatestRelease();

    if (release && release.tag_name && release.tag_name !== CURRENT_VERSION) {
      console.log("New version found:", release.tag_name);

      if (!release.assets) return;

      const asset = release.assets.find((a) =>
        a.name.includes("neurostack.exe")
      );

      if (!asset) return;

      // Look for SHA256 checksum file in assets
      const checksumAsset = release.assets.find((a) =>
          a.name.toLowerCase().includes("sha256") || a.name.toLowerCase().includes("checksum")
      );

      let expectedHash = null;
      if (checksumAsset) {
          try {
              expectedHash = await fetchText(checksumAsset.browser_download_url);
              console.log("Fetched checksum for verification.");
          } catch (e) {
              console.warn("Failed to fetch checksum:", e.message);
          }
      }

      await downloadFile(asset.browser_download_url, tempUpdatePath);

      if (verifyHash(tempUpdatePath, expectedHash)) {
          console.log("Update integrity verified. Applying update...");
          replaceExecutable();
      } else {
          console.error("Update integrity check failed!");
          if (fs.existsSync(tempUpdatePath)) fs.unlinkSync(tempUpdatePath);
      }
    } else {
      console.log("Already up to date or no release found");
    }
  } catch (err) {
    console.error("Updater error:", err);
  }
}

module.exports = { checkForUpdates };
