const _ = require('lodash');
const config = require('config');
const HTTPSnippet = require('httpsnippet');
const codemirror = require('../hub2/lib/codemirror').codemirror;
const jsonSchemaRefParser = require('json-schema-ref-parser');
const swaggerParser = require('swagger-parser');
const extensions = require('readme-oas-extensions');

/* Used for converting things to the Swagger format */

exports.bundle = function (url, cb) {
  // Just like swagger-parser.bundle, except"
  //  * Can deal with $refs better (upgraded json-schema-ref-parser)
  //  * Validates it (swagger-parser.validate will also dereference)
  //  * Returns an bundled, un-deref'd version... and a deref'd one!

  // We need to use jsonSchemaRefParser rather than Swagger-Parser
  // here, because otherwise $refs are parsed wrong b/c s-p is on
  // and old version of jsonSchemaRefParser. swagger-parser.bundle
  // literally just calls jsonSchemaRefParser, so this works fine!

  jsonSchemaRefParser.bundle(url, (err, swaggerFileBundle) => {
    if (err) return cb(err);
    // We need to clone it because `validate` modifies the original object
    return swaggerParser.validate(_.cloneDeep(swaggerFileBundle), (err2, swaggerFileDeref) => {
      if (err2) return cb(err2);
      return cb(null, swaggerFileBundle, swaggerFileDeref);
    });
  });
};

exports.splitUrl = function (url) {
  if (!url) {
    return {
      schemes: [],
      host: '',
      basePath: '',
    };
  }

  if (url.indexOf('/') === 0) {
    url = `example.com${url}`;
  }

  if (url.indexOf('http') !== 0) {
    url = `http://${url}`;
  }

  const split = url.match(/(http[s]?):\/\/([^/]+)(.*)/);
  return {
    schemes: [split[1]],
    host: split[2],
    basePath: split[3],
  };
};

// Do not change this without modifying the doc
// https://readme.readme.io/v2.0/docs/swagger-categories-pages-subpages#section-subpages
function hasTags(path) {
  return path.tags && path.tags.length && path.tags[0].length;
}
exports.getPageTitle = (path, method, url) => (path.summary || (hasTags(path) ? url : method));
exports.getTag = (path, url) => (hasTags(path) ? path.tags[0] : url);

exports.makeOperationId = (endpoint) => {
  if (endpoint.operationId) return endpoint.operationId;

  const url = endpoint._path.replace(/[^a-zA-Z0-9]/g, '-') // Remove weird characters
  .replace(/^-|-$/g, '') // Don't start or end with -
  .replace(/--+/g, '-') // Remove double --'s
  .toLowerCase();
  return `${endpoint._method}_${url}`;
};

exports.hasAuth = function (swagger) {
  const securitySettings = swagger._endpoint.security || swagger.security;
  if (securitySettings && Object.keys(securitySettings).length > 0) {
    return true;
  }
  return false;
};

// Swagger security -> {'Header': [...], 'Basic Auth': [...]}
exports.prepareSecurity = function (swagger) {
  const out = {};
  const securitySettings = swagger._endpoint.security || swagger.security;
  _.each(securitySettings, (securitySetting) => {
    let security;
    let key;
    try {
      key = Object.keys(securitySetting)[0];
      security = swagger.securityDefinitions[key];
    } catch (e) {
      return;
    }

    if (!security) return;
    let type = security.type;
    if (security.type === 'basic') {
      type = 'Basic';
    } else if (security.type === 'oauth2') {
      type = 'OAuth2';
    } else if (security.type === 'apiKey' && security.in === 'query') {
      type = 'Query';
    } else if (security.type === 'apiKey' && security.in === 'header') {
      type = 'Header';
    }

    security._key = key;

    if (!out[type]) out[type] = [];
    out[type].push(security);
  });
  return out;
};

// Convert ReadMe Doc -> Swagger endpoint
exports.params = function (url, doc) {
  const params = doc.api.params;
  const settings = doc._apiSetting();

  const outParams = [];
  const otherParams = [];

  // var pathVars = _.map(url.match(/\{(.[^}]+)\}/g), url => { url.substr(1, url.length - 2); });

  _.each(params, (param) => {
    const paramFormatted = {
      name: param.name,
      in: param.in,
      description: param.desc,
      required: param.required,
    };

    if (param.type === 'object' && settings.manual.definitions) {
      const ref = settings.manual.definitions.filter(references => param.ref === references.name)[0];
      paramFormatted.properties = {};
      if (ref) {
        for (const parameter of ref.parameters) {
          paramFormatted.properties[parameter.name] = {
            type: parameter.type,
            description: parameter.desc,
            required: parameter.required,
          };
        }
      }
    }

    if (param.type === 'array_object' && settings.manual.definitions) {
      const ref = settings.manual.definitions.filter(references => param.ref === references.name)[0];
      if (ref) {
        paramFormatted.items = { properties: {} };
        for (const parameter of ref.parameters) {
          paramFormatted.items.properties[parameter.name] = {
            type: parameter.type,
            description: parameter.description,
          };
          paramFormatted.items.type = 'object';
        }
      }
    }

    if (param.in === 'path') {
      paramFormatted.required = true;
    }

    _.merge(paramFormatted, exports.normalizeParamType(param));

    if (param.in === 'body') {
      otherParams.push(paramFormatted);
    } else {
      outParams.push(paramFormatted);
    }
  });

  // Should we go with formData or body?
  let otherType;
  if (settings.manual.consumes.indexOf('application/x-www-form-urlencoded') !== -1 || settings.manual.consumes.indexOf('multipart/form-data') !== -1) {
    otherType = 'formData';
  } else {
    otherType = 'body';
  }

  if (otherType === 'formData') {
    _.each(otherParams, (param) => {
      delete param.in;
      param.in = 'formData';
      outParams.push(param);
    });
  } else {
    const body = {
      name: 'body',
      in: 'body',
      schema: {
        type: 'object',
        required: [],
        properties: {},
      },
    };

    body.schema.properties = exports.generateSchema(otherParams, body.schema.required);
    if (!body.schema.required.length) {
      delete body.schema.required;
    }

    outParams.push(body);
  }
  return outParams;
};

const dotize = (function () {
  function parsePath(path, sep) {
    if (path.indexOf('[') >= 0) {
      path = path.replace(/\[/g, '.').replace(/]/g, '');
    }
    return path.split(sep);
  }

  function isObject(val) {
    return Object.prototype.toString.call(val) === '[object Object]';
  }

  return function (path, val, obj) {
    let i;
    const keys = parsePath(path, '.');
    let key;

    // Do not operate if the value is undefined.
    if (typeof val === 'undefined') {
      return obj;
    }

    for (i = 0; i < keys.length; i += 1) {
      key = keys[i];
      if (i === (keys.length - 1)) {
        obj[key] = val;
      } else if (

        // force the value to be an object
        !obj.hasOwnProperty(key) || (!isObject(obj[key]) && !Array.isArray(obj[key]))) {
        // initialize as array if next key is numeric
        if (/^\d+$/.test(keys[i + 1])) {
          obj[key] = [];
        } else {
          obj[key] = {};
        }
      }
      obj = obj[key];
    }
    return obj;
  };
}());

exports.generateSchema = function (params, req) {
  const values = {};
  const raw = {};

  _.each(params, (param) => {
    raw[param.name] = param;
    dotize(param.name, param.name, values);
  });

  function expandObjects(properties, required) {
    _.each(properties, (prop, i) => {
      if (_.isObject(prop)) {
        prop.properties = _.clone(prop);
        if (prop in raw) {
          prop.description = raw[prop].description;
        }
        _.each(prop.properties, (eh, k) => {
          if (k !== 'properties') {
            delete prop[k];
          }
        });
        prop.required = [];
        prop.type = 'object';
        expandObjects(prop.properties, prop.required);
      } else {
        if (required && raw[prop].required) {
          required.push(i);
        }

        properties[i] = {
          type: raw[prop].type,
          description: raw[prop].description,
          default: raw[prop].default,
          format: raw[prop].format,
          items: raw[prop].items,
          properties: raw[prop].properties,
        };
      }
    });
  }
  expandObjects(values, req);
  return values;
};

exports.castValue = function (value, type) {
  if (!value) return undefined;

  if (type === 'string') return value;
  if (type === 'boolean') return value === 'true';
  if (type === 'integer') return Number(value);

  return value;
};

exports.normalizeParamType = function (param) {
  const paramType = param.type;

  const out = {};

  if (paramType === 'array_object') {
    out.type = 'array';
    return out;
  }

  if (paramType.indexOf('array_') === 0) {
    out.type = 'array';
    const paramItem = {
      type: param.type.replace(/array_/, ''),
    };
    out.items = exports.normalizeParamType(paramItem);
    return out;
  }

  if (paramType === 'object') {
    out.type = 'object';
    return out;
  }

  // For mixed type arrays created in readme
  if (paramType === 'mixed') {
    out.type = 'mixed type';
    return out;
  }

  if (['string', 'boolean', 'file'].indexOf(paramType) >= 0) {
    out.type = paramType;
    out.default = exports.castValue(param.default, out.type);
    return out;
  }

  if (['int', 'double', 'long', 'float'].indexOf(paramType) >= 0) {
    out.type = 'integer';

    const formats = {
      int: 'int32',
      long: 'int64',
      float: 'float',
      double: 'double',
    };

    out.format = formats[paramType];
    out.default = exports.castValue(param.default, out.type);

    return out;
  }

  if (['yyyy-mm-dd', 'datetime', 'timestamp'].indexOf(paramType) >= 0) {
    out.type = 'string';
    if (paramType === 'datetime' || paramType === 'yyyy-mm-dd') {
      out.format = 'date';
    } else {
      out.format = 'date-time';
    }
    out.default = exports.castValue(param.default, out.type);
    return out;
  }

  if (paramType === 'json') {
    out.type = 'json';
    out.default = param.default;
    return out;
  }

  return undefined;
};

exports.chunkUrl = function (swagger) {
  // TODO: Put this back in! Because of reference issues, it's overwritten
  // and doesn't work.
  // if (swagger._chunkUrl) return swagger._chunkUrl;

  if (!swagger._path) return [];

  const params = _.indexBy(swagger._endpoint.parameters, 'name');

  const urlSplit = [];
  let isVar = false;
  _.each(swagger._path.split(/[{}]/), (p) => {
    if (p) {
      if (isVar) {
        urlSplit.push({
          type: 'variable',
          value: p,
          param: params[p],
        });
      } else {
        urlSplit.push({ type: 'text', value: p });
      }
    }
    isVar = !isVar;
  });

  swagger._chunkUrl = urlSplit;
  return urlSplit;
};

exports.groupParams = function (swagger) {
  const sortedParams = {
    path: { name: 'Path Params', params: [] },
    query: { name: 'Query Params', params: [] },
    body: { name: 'Body Params', params: [] },
    formData: { name: 'Form Data', params: [] },
    header: { name: 'Headers', params: [] },
  };

  const existingParams = []; // For inheriting from the parent
  _.each(swagger._endpoint.parameters, (param) => {
    if (param.in !== 'body') {
      existingParams.push(`${param.in}--${param.name}`);
    } else {
      existingParams.push(param.in);
    }

    if (param.readOnly) {
      return;
    }
    sortedParams[param.in].params.push(param);
  });

  // Okay, so Swagger lets you inherit params from swagger.paths[/hi].parameters,
  // so that's what we're doing here.
  const inheritedParams = swagger.paths[swagger._path].parameters;
  _.each(inheritedParams, (param) => {
    const paramIn = param.in === 'body' ? 'body' : `${param.in}--${param.name}`;
    if (existingParams.indexOf(paramIn) > -1) {
      return;
    }
    if (param.readOnly) {
      return;
    }
    sortedParams[param.in].params.push(param);
  });

  _.each(sortedParams, (sp, key) => {
    if (!sp.params.length) {
      delete sortedParams[key];
    }
    if (key === 'body' && (!sp.params.length || !_.keys(sp.params[0].schema.properties).length)) {
      delete sortedParams[key];
    }
  });

  return sortedParams;
};

exports.convertToParams = function (params, paramIn) {
  if (paramIn !== 'body' && paramIn !== 'response') {
    return exports.convertOtherToParams(params);
  }

  return exports.convertBodyToParams(params);
};

exports.convertOtherToParams = function (params, parent) {
  let paramsOut = [];
  _.each(params, (p, k) => {
    if (p.readOnly) return; // These only show up in responses

    const param = _.clone(p);
    param.name = parent ? `${parent.name}.${k}` : `${p.name}`;
    paramsOut.push(param);

    if (p.type === 'object') {
      paramsOut = paramsOut.concat(exports.convertOtherToParams(p.properties, p));
    }
  });

  return paramsOut;
};

exports.convertBodyToParams = function (params, isChild, parent, stack = 0) {
  let paramsOut = [];
  _.each(isChild ? params : params[0].schema.properties, (p, k) => {
    if (p.readOnly) return; // These only show up in responses

    const param = _.clone(p);
    param.name = (isChild ? `${isChild}.` : '') + k;
    paramsOut.push(param);
    if (_.isUndefined(param.required)) {
      if (isChild) { // I don't know if it should only be root elements... but for now, why not
        param.required = parent.required && parent.required.includes(k);
      } else if (!parent) {
        param.required = params[0].schema.required && params[0].schema.required.indexOf(param.name) >= 0;
      }
    }
    if (p.type === 'object' && stack < 3) {
      paramsOut = paramsOut.concat(exports.convertBodyToParams(p.properties, param.name, p, stack + 1));
    }
  });

  return paramsOut;
};

// TODO remove these
exports._showCodeUtil = function (type) {
  return function (swagger) {
    if (swagger._cache[type]) return swagger._cache[type];

    if (swagger._original) {
      // This is Hub1-style stuff (TODO, add this to fauxSwagger and not here!!)

      const doc = swagger._original;

      if (!doc.api[type] || !doc.api[type].codes || !doc.api[type].codes.length) {
        return [];
      }

      const filtered = _.filter(doc.api[type].codes, i => i.code && i.code !== '{}');
      swagger._cache[type] = filtered;
      return filtered;
    }

    // This is an experimental implementation of Swagger's endpoint stuff!

    const codes = [];
    if (type === 'results') { // Only examples so far...
      if (swagger._endpoint.responses) {
        try {
          _.each(swagger._endpoint.responses, (response, status) => {
            if (response.examples) {
              const lang = Object.keys(response.examples)[0];
              const example = response.examples[lang];

              codes.push({
                code: _.isObject(example) ? JSON.stringify(example, undefined, 2) : example,
                language: lang,
                status,
              });
            }
          });
        } catch (e) {
          console.log('Error with responses', e);
        }
      }
    }

    swagger._cache[type] = codes;
    return codes;
  };
};
exports.showCodeResults = exports._showCodeUtil('results');
exports.showCodeExamples = exports._showCodeUtil('examples');
exports.showCode = function (swagger) {
  const hasExamples = exports.showCodeExamples(swagger).length;
  const hasResults = exports.showCodeResults(swagger).length;
  const hasTryItNow = swagger[extensions.EXPLORER_ENABLED];
  return hasExamples || hasResults || hasTryItNow;
};

exports.getAsHAR = function (swagger, values) {
  const params = this.groupParams(swagger);

  Array.prototype.toString = function () { // eslint-disable-line no-extend-native
    return JSON.stringify(this);
  };

  const har = {
    headers: [],
    queryString: [],
    postData: {
      // TODO: This should probably use the same as the frontend
      mimeType: swagger.produces ? swagger.produces[0] : 'application/json',
    },
  };

  // TODO: Deal with required

  har.method = swagger._method.toUpperCase();

  const format = {
    value: v => `__START_VALUE__${v}__END__`,
    default: v => `__START_DEFAULT__${v}__END__`,
    key: v => `__START_KEY__${v}__END__`,
  };

  const formatter = function (param, type, onlyIfExists) {
    if (values[type][param.name]) {
      return format.value(values[type][param.name]);
    }
    if (onlyIfExists && !param.required) {
      return undefined;
    }
    if (param.required && param.default) {
      return format.default(param.default);
    }
    return format.key(param.name);
  };

  let url = '';
  url += `${swagger.schemes && swagger.schemes.length ? swagger.schemes[0] : 'http'}://`;
  url += swagger.host;
  url += swagger.basePath || '';
  url += swagger._path;

  har.url = url;
  har.url = har.url.replace(/\s/g, '%20');
  har.url = har.url.replace(/{([-_a-zA-Z0-9\[\]]+)}/g, (full, key) => {
    if (!params || !params.path) return key; // No path params at all

    let param = _.find(params.path.params, { name: key });
    if (!param) param = { name: key }; // This path param isn't defined

    return encodeURIComponent(formatter(param, 'path'));
  });

  // The above stuff is only if it's not a post; we should fix this somehow!
  // The initial load of this is missing some data.

  if (values.url) har.url = values.url;

  if (params.query) {
    _.each(params.query.params, (query) => {
      const value = formatter(query, 'query', true);
      if (!value) return;
      har.queryString.push({
        name: query.name,
        value: String(value),
      });
    });
  }

  if (params.header) {
    _.each(params.header.params, (header) => {
      const value = formatter(header, 'header', true);
      if (!value) return;
      har.headers.push({
        name: header.name,
        value: String(value),
      });
    });
  }

  // TODO: It'd be nice to highlight these...
  if (Object.keys(values.body).length) {
    const expandedValues = {};
    _.each(values.body, (v, k) => {
      dotize(k, v, expandedValues);
    });
    har.postData.text = JSON.stringify(expandedValues);
  }
  if (Object.keys(values.formData).length) {
    const expandedValues = {};
    _.each(values.formData, (v, k) => {
      dotize(k, v, expandedValues);
    });
    har.postData.text = JSON.stringify(expandedValues);
  }

  return har;
};

const langsAll = {
  node: {
    httpsnippet: ['node', 'request'],
    highlight: 'javascript',
    name: 'Node',
  },
  curl: {
    httpsnippet: ['shell', 'curl'],
    highlight: 'shell',
    name: 'cURL',
  },
  ruby: {
    httpsnippet: ['ruby'],
    highlight: 'ruby',
    name: 'Ruby',
  },
  javascript: {
    httpsnippet: ['javascript', 'jq'],
    highlight: 'javascript',
    name: 'JavaScript',
  },
  objectivec: {
    httpsnippet: ['objc', 'NSURLSession'],
    highlight: 'objectivec',
    name: 'Objective-C',
  },
  python: {
    httpsnippet: ['python', 'requests'],
    highlight: 'python',
    name: 'Python',
  },
  java: {
    httpsnippet: ['java', 'okhttp'],
    highlight: 'java',
    name: 'Java',
  },
  php: {
    httpsnippet: ['php', 'curl'],
    highlight: 'php',
    name: 'PHP',
  },
  csharp: {
    httpsnippet: ['csharp', 'restsharp'],
    highlight: 'text/x-csharp',
    name: 'C#',
  },
  swift: {
    httpsnippet: ['swift', 'nsurlsession'],
    highlight: 'swift',
    name: 'Swift',
  },
  go: {
    httpsnippet: ['go', 'native'],
    highlight: 'go',
    name: 'Go',
  },
};

exports.getLangName = lang => langsAll[lang].name;

exports.getCodeSnippet = function (swagger, langs, values) {
  if (!values) {
    values = { query: {}, header: {}, body: {}, formData: {}, path: {}, url: undefined };
  }

  // Temporary, fixes any weird URLs (like [[app:...]])
  if (!swagger.host || swagger.host.match(/\[\[/)) {
    swagger.host = 'example.com';
  }

  const har = exports.getAsHAR(swagger, values);
  const snippet = new HTTPSnippet(har);

  const codes = {};
  _.each(langs, (langName) => {
    const lang = langsAll[langName];
    let code = snippet.convert(lang.httpsnippet[0], lang.httpsnippet[1]);
    code = codemirror(code, lang.highlight, true);

    code = code.replace(new RegExp('__START_VALUE__', 'g'), '<span class="hub-code-param">');
    code = code.replace(new RegExp('__START_DEFAULT__', 'g'), '<span class="hub-code-param">');
    code = code.replace(new RegExp('__START_KEY__', 'g'), '<span class="hub-code-param-empty">');
    code = code.replace(new RegExp('__END__', 'g'), '</span>');

    codes[langName] = `<span class="cm-s-tomorrow-night">${code}</span>`;
  });

  return codes;
};

exports.fixRequired = function (params) {
  return params;
};

exports.security = function (security) {
  const out = {};
  let i = 0;
  _.each(security, (sec) => {
    // We don't have names since it's manual, and we never use the names
    // publicly, so just generate them!
    out[`sec${i}`] = sec;
    i += 1;
  });
  return out;
};

exports.prepareMiniSwaggerInline = function (swagger) {
  return JSON.stringify({
    data: {
      swagger,
      chunkUrl: exports.chunkUrl(swagger),
      proxy_url: config.proxy_hub2_url,
    },
  });
};
