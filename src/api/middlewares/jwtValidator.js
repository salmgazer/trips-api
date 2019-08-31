const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

module.exports = (req, res, next) => {
  if (!req.user) {
    return next();
  }

  const jwtOptions = {
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${_config.auth0.issuer}.well-known/jwks.json`,
    }),
    audience: req.user.aud,
    issuer: _config.auth0.issuer,
    algorithms: ['RS256'],
  };
  return jwt(jwtOptions);
};
