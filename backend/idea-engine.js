// idea-engine.js
const axios = require("axios");

async function generateIdeas() {
  if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY not set, generating dummy ideas.");
      return [
          { niche: "AI Writing", problem: "Writing is hard", solution: "AI writes for you", monetization: "SaaS" },
          { niche: "Fitness AI", problem: "No personal trainer", solution: "AI workout plan", monetization: "Subscription" }
      ];
  }

  const prompt = `
You are a startup generator AI.

Generate 5 SaaS ideas with:
- niche
- problem
- solution
- monetization

Return JSON array of objects.
`;

  try {
    const res = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      }, {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
      });

      // Handle response which might be wrapped in an object like { "ideas": [...] }
      const content = JSON.parse(res.data.choices[0].message.content);
      return Array.isArray(content) ? content : (content.ideas || []);
  } catch (e) {
      console.error("Idea engine error:", e.message);
      return [];
  }
}

module.exports = { generateIdeas };
