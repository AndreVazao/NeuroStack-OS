// builder.js
const fs = require("fs");
const path = require("path");

function createSaaS(name) {
  // Use a projects directory to store generated SaaS apps
  const base = path.join(process.cwd(), "saas", name);

  if (!fs.existsSync(base)) {
      fs.mkdirSync(base, { recursive: true });
  }

  // backend server.js
  fs.writeFileSync(
    path.join(base, "server.js"),
`const express = require("express");
const app = express();

app.get("/", (req,res)=>res.send("${name} running"));

app.listen(3000, () => {
    console.log("${name} server listening on port 3000");
});`
  );

  // package.json
  fs.writeFileSync(
    path.join(base, "package.json"),
JSON.stringify({
  name,
  version: "1.0.0",
  main: "server.js",
  dependencies: { express: "^4.18.2" }
}, null, 2)
  );

  return base;
}

module.exports = { createSaaS };
