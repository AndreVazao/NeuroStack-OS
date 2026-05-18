// startup-factory.js
const { generateIdeas } = require("./idea-engine");
const { filterIdeas } = require("./validator");
const { createSaaS } = require("./builder");
const { deploy } = require("./deploy-saas");

const VALIDATION_THRESHOLD = 10; // Minimum "waitlist" signups required

async function validateMarket(idea) {
    console.log(`Validating market for: ${idea.niche}...`);
    // Simulate landing page generation and waitlist collection
    // In a real system, this would involve scraping or social media APIs
    const simulatedWaitlist = Math.floor(Math.random() * 20);
    console.log(`Simulated waitlist for ${idea.niche}: ${simulatedWaitlist}`);
    return simulatedWaitlist;
}

async function runFactory() {
  console.log("--- Starting Startup Factory ---");
  try {
    const ideas = await generateIdeas();
    const valid = filterIdeas(ideas);

    for (const idea of valid) {
      const waitlistSize = await validateMarket(idea);

      if (waitlistSize < VALIDATION_THRESHOLD) {
          console.log(`Idea ${idea.niche} rejected: low market interest (${waitlistSize} < ${VALIDATION_THRESHOLD})`);
          continue;
      }

      const name = idea.niche.replace(/\s/g, "-").toLowerCase();
      console.log(`Market validated! Building SaaS: ${name}`);

      const projectPath = createSaaS(name);
      deploy(projectPath);
    }
  } catch (e) {
      console.error("Startup Factory error:", e.message);
  }
}

function startStartupFactory(intervalMs = 3600000) { // Default every hour
    setTimeout(runFactory, 5000);
    setInterval(runFactory, intervalMs);
}

module.exports = { runFactory, startStartupFactory };
