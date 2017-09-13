const marked = require('marked');

const renderer = new marked.Renderer();

renderer.image = function image(href, title, text) {
  let out = `<img src="${href}" alt="${text}"`;
  if (title && title.substr(0, 6) === 'style|') {
    out += ` style="${title.substr(6).replace(/"/g, "'")}"`;
  } else if (title && title.substr(0, 5) === 'right') {
    out += ' style="float: right; margin 0 0 15px 15px;"';
  } else if (title && title.substr(0, 4) === 'left') {
    out += ' style="float: left; margin 0 15px 15px 0;"';
  } else if (title) {
    out += ` title="${title}"`;
  }

  out += this.options.xhtml ? '/>' : '>';
  return out;
};

renderer.listitem = function listitem(text, val) {
  const valAttr = val ? ` value="${val}"` : '';
  if (/^\s*\[[x ]\]\s*/.test(text)) {
    text = text
      .replace(/^\s*\[ \]\s*/, '<input type="checkbox" disabled> ')
      .replace(/^\s*\[x\]\s*/, '<input type="checkbox" checked disabled> ');
    return `<li style="list-style: none" class="checklist">${text}</li>`;
  }

  return `<li ${valAttr}>${text}</li>`;
};

renderer.table = function table(header, body) {
  return (
    `${'<div class="marked-table"><table>\n<thead>\n'}${header}</thead>\n` +
    `<tbody>\n${body}</tbody>\n</table></div>\n`
  );
};

renderer.heading = function heading(text, level, raw) {
  const id = this.options.headerPrefix + raw.toLowerCase().replace(/[^\w]+/g, '-');

  return (
    `<h${level} class="header-scroll">` +
    `<div class="anchor waypoint" id="section-${id}"></div>${text}<a class="fa fa-anchor" href="#section-${id}"></a>` +
    `</h${level}>\n`
  );
};

renderer.link = function link(href, title, text) {
  /* eslint no-param-reassign: 0 */
  const doc = href.match(/^doc:([-_a-zA-Z0-9#]*)$/);
  let isDoc = false;
  let uiSref = false;

  if (href.match(/^(data|javascript)[^a-zA-Z0-9/_-]/i)) {
    // Avoid XSS
    href = '';
  }

  if (doc) {
    uiSref = `docs.show({'doc': '${doc[1]}'})`;
    href = '';
    isDoc = doc[1];
  }

  const ref = href.match(/^ref:([-_a-zA-Z0-9#]*)$/);
  if (ref) {
    const cat = '';
    // TODO https://github.com/readmeio/api-explorer/issues/28
    // if (req && req.project.appearance.categoriesAsDropdown) {
    //   cat = `/${req._referenceCategoryMap[ref[1]]}`;
    // }
    href = `/reference${cat}#${ref[1]}`;
  }

  const blog = href.match(/^blog:([-_a-zA-Z0-9#]*)$/);
  if (blog) {
    uiSref = `blog.show({'blog': '${blog[1]}'})`;
    href = '';
  }

  const custompage = href.match(/^page:([-_a-zA-Z0-9#]*)$/);
  if (custompage) {
    uiSref = `custompages.show({'custompage': '${custompage[1]}'})`;
  }

  if (this.options.sanitize) {
    let prot;
    try {
      prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    // eslint-disable-next-line no-script-url
    if (prot.indexOf('javascript:') === 0) {
      return '';
    }
  }

  let out = '<a';

  out += ` href="${href}"`;

  if (uiSref) {
    out += ` ui-sref="${uiSref}"`;
  } else {
    // This prevents full links from getting
    // into a weird AJAX state
    out += ' target="_self"';
  }

  if (title) {
    out += ` title="${title}"`;
  }
  if (isDoc) {
    out += ` class="doc-link" data-sidebar="${isDoc}"`;
  }
  out += `>${text}</a>`;
  return out;
};

module.exports = renderer;
