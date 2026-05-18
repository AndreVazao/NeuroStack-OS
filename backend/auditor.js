// auditor.js
const axios = require("axios");

async function auditCode(code) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY not set, skipping AI audit.");
    return { score: 100, risks: [], safe: true };
  }

  const prompt = `
You are a security auditor.

Analyze this Node.js code and return JSON:
{
  "score": 0-100,
  "risks": ["..."],
  "safe": true/false
}

CODE:
${code}
`;

  try {
    const res = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    return JSON.parse(res.data.choices[0].message.content);
  } catch (e) {
    console.error("AI Audit error:", e.message);
    return { score: 0, risks: ["Audit failed"], safe: false };
  }
}

async function validatePlugin(code) {
  const audit = await auditCode(code);

  if (!audit.safe || audit.score < 70) {
    throw new Error("Plugin rejected by AI auditor: " + audit.risks.join(", "));
  }

  return audit.score;
}

module.exports = { auditCode, validatePlugin };
