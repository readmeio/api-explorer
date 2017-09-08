const magicFileHub2 = jade.compileFile('./hub2/views/magic/content.jade', { pretty: '\t' });
exports.renderMagic = function (req, content, opts, variables) {
  if (!opts) opts = {};
  const fns = {
    marked: marked.configure(req),
    statusCodes: shared.statusCodes,
    codemirror: codemirror.codemirror,
    codemirrorUppercase: codemirror.uppercase,
    slugify: shared.slugify,
    exists: exports.exists,
    uslug,
  };

  const locals = _.extend({}, fns, {
    content: magictext.parseBlocks(content),
    opts,
    json: JSON.stringify,
  });

  const magicFile = magicFileHub2;

  if (opts && opts.isThreeColumn) {
    const section = { left: [], right: [] };
    locals.content.forEach((elem) => {
      if (elem.sidebar) {
        section.right.push(elem);
      } else {
        section.left.push(elem);
      }
    });

    locals.content = section;
  }

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
