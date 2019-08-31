import querystring from 'querystring';

export default class UrlBuilder {
  static urlFor(path, basePath, params = undefined) {
    let result = `${_config.schema}://${_config.host}${basePath}${path}`;
    if (params) {
      result += `?${querystring.stringify(params)}`;
    }
    return result;
  }
}
