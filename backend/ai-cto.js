// ai-cto.js
const fs = require("fs");
const axios = require("axios");

const STATE_FILE = "./system-state.json";

async function generateRoadmap() {
  let state = {};
  if (fs.existsSync(STATE_FILE)) {
    state = JSON.parse(fs.readFileSync(STATE_FILE));
  } else {
    state = { status: "initial", services: [], plugins: [] };
  }

  if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY not set, generating dummy roadmap.");
      const roadmap = {
          roadmap: [
              { title: "Optimize Process Management", priority: "medium", type: "optimize" },
              { title: "Implement Auth Middleware", priority: "high", type: "feature" }
          ]
      };
      fs.writeFileSync("./roadmap.json", JSON.stringify(roadmap, null, 2));
      return roadmap;
  }

  const prompt = `
You are a CTO of an AI system.

Analyze current system state and decide:
- what features to build next
- what bugs to fix
- what to optimize

Return JSON:
{
  "roadmap": [
    { "title": "...", "priority": "high", "type": "feature|bug|optimize" }
  ]
}

STATE:
${JSON.stringify(state, null, 2)}
`;

  try {
    const res = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );

      const roadmap = JSON.parse(res.data.choices[0].message.content);

      fs.writeFileSync("./roadmap.json", JSON.stringify(roadmap, null, 2));

      return roadmap;
  } catch (e) {
      console.error("AI CTO Roadmap generation error:", e.message);
      return { roadmap: [] };
  }
}

module.exports = { generateRoadmap };
