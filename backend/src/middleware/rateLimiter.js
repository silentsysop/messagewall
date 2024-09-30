const rateLimit = require('express-rate-limit');

const reactRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 30, // limit each user to 10 reactions per windowMs
  message: { error: 'Too many reactions created from this IP, please try again after a minute' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = {
  reactRateLimiter,
};