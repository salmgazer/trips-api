const cors = require('cors');

const whitelist = [
  'localhost:4500',
  'localhost:3000',
	'localhost:3030',
];

const corsOptions = {
  origin: (origin, callback) => {
    let allowed = false;
    // if origin is undefined means there is no referer so we are accessing from the same domain https://github.com/expressjs/cors/issues/113
    if (!origin) {
      allowed = true;
    } else {
      whitelist.forEach((host) => {
        if (origin.match(host)) {
          allowed = true;
        }
      });
    }
    /* eslint no-unused-expressions: ["error", { "allowTernary": true }] */
    allowed ? callback(null, true) : callback(new Error(`${origin} Not allowed by CORS`));
  },
};

module.exports = cors(corsOptions);
