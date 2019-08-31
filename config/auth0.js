module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  auth0Audience: process.env.AUTH0_AUDIENCE,
  namespace: 'https://rovebus.com/authorization',
  issuer: 'https://rovebus.eu.auth0.com/',
};
