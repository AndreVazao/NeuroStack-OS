// analytics.js
let metrics = {
  visits: 0,
  actions: 0
};

function trackVisit() {
  metrics.visits++;
}

function trackAction() {
  metrics.actions++;
}

function getMetrics() {
  return metrics;
}

module.exports = {
  trackVisit,
  trackAction,
  getMetrics
};
