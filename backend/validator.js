// validator.js
function scoreIdea(idea) {
  let score = 0;

  if (idea.problem && idea.problem.length > 20) score += 2;
  if (idea.solution && idea.solution.length > 20) score += 2;

  if (idea.niche && idea.niche.toLowerCase().includes("ai")) score += 2;

  return score;
}

function filterIdeas(ideas) {
  return ideas.filter(i => scoreIdea(i) >= 4);
}

module.exports = { scoreIdea, filterIdeas };
