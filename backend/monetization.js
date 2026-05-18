// monetization.js
function attachMonetization(app) {
  app.get("/pricing", (req, res) => {
    res.send(`
      <h1>Premium Plan</h1>
      <p>Unlock all features for .99/month</p>
      <a href="https://buy.stripe.com/test">Subscribe Now</a>
    `);
  });
}

module.exports = { attachMonetization };
