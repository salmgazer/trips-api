/* eslint-disable global-require, prefer-destructuring */
import jwtDecode from 'jwt-decode';

export default class UserHelper {
  static get requestNamespace() {
    return require('cls-hooked').getNamespace('request') || {};
  }

  static attachUserToRequest(req, res, next, auth0Namespace) {
    try {
      this.requestNamespace.set('currentUserApiToken', req.headers.authorization);

      const decoded = jwtDecode(this.requestNamespace.get('currentUserApiToken'));
      const currentTime = Math.floor(new Date() / 1000);

      if (decoded) {
        if (currentTime > decoded.exp) {
          res.status(401).send({
            code: 401,
            message: 'JWT Token has expired',
          });
          return;
        }

        const userAuthorization = Object.assign({}, decoded[auth0Namespace]);
        delete decoded[auth0Namespace];
        req.user = Object.assign(userAuthorization, decoded);
        this.requestNamespace.set('currentUserEmail', decoded.email);
      } else {
        res.status(401).send({
          code: 401,
          message: 'There is a problem with token',
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({
        code: 500,
        message: 'There is a problem with attachUserToRequest',
        error,
      });
    }
  }

  static async validatePermissions(req, res, next, apiName) {
    if (!req.user) {
      res.status(401).send({
        code: 401,
        error: 'Not authenticated',
        message: 'You need to login',
      });
    }

		const permission = req.swagger.operation['x-permission'];
		const resource = req.swagger.operation['x-resource'];
		const requestPermission = `${apiName}_${permission}_${resource}`;

		if (req.user.permissions.includes(requestPermission) || process.env.NODE_ENV === 'test') {
		  next();
    } else {
			res.status(403).send({
				code: 403,
				error: `You do not have permission to ${permission} ${resource}`,
				message: `You do not have permission to ${permission} ${resource}`,
			});
		}
  }
}
