// saas-cto.js
function evaluate(metrics) {
  if (metrics.visits < 10) return "kill";
  if (metrics.actions > 5) return "scale";
  return "wait";
}

module.exports = { evaluate };
