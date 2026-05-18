// backend/plugin-rating.js
const ratings = new Map();

function ratePlugin(name, score) {
  if (!ratings.has(name)) {
    ratings.set(name, []);
  }

  ratings.get(name).push(score);
}

function getTrustScore(name) {
  const scores = ratings.get(name) || [];
  if (scores.length === 0) return 0;

  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function computeTrust(plugin) {
  let score = 0;

  // Basic trust calculation logic
  if (plugin.auditScore > 80) score += 40;
  if (plugin.downloads > 100) score += 20;
  if (plugin.errors === 0) score += 20;
  if (plugin.permissions && plugin.permissions.length <= 2) score += 20;

  return score;
}

module.exports = { ratePlugin, getTrustScore, computeTrust };
