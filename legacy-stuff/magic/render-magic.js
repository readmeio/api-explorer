const magicFileHub2 = jade.compileFile('./hub2/views/magic/content.jade', { pretty: '\t' });
exports.renderMagic = function (req, content, opts, variables) {
  if (!opts) opts = {};


  const locals = _.extend({}, fns, {
    content: ,
    opts,
    json: JSON.stringify,
  });

  const magicFile = magicFileHub2;



  let out = magicFile(locals);

  // Replace brackets to prevent angular
  out = out.replace(/{{/g, '<span ng-non-bindable>&#123;&#123;').replace(/}}/g, '&#125;&#125;</span>');

  // Make app[key] work with speedy render
  if (opts.cookie) {
    try {
      const app = JSON.parse(decodeURIComponent(opts.cookie));
      out = out.replace(/\[\[app:(\w*)\]\]/g, (full, key) => app[key] || `YOUR_APP_${key.toUpperCase()}`);
    } catch (e) {
      console.log(`Error parsing cookie in renderMagic: ${e}`);
    }
  }

  if (!out.trim()) return '&nbsp;';

  // Variable stuff

  // For situation where variables aren't passed in
  if (!variables) return out;

  out = exports.replaceVars(out, variables);

  return out;
};
