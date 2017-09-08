// const marked = require('marked');
// const Emoji = require('./emojis.js').emoji;
// const syntaxHighlighter = require('../../../readme-syntax-highlighter');
//
// // Configure marked
// exports.configure = function (req) {
//   const renderer = new marked.Renderer();
//
//   renderer.image = function (href, title, text) {
//     let out = `<img src="${href}" alt="${text}"`;
//     if (title && title.substr(0, 6) === 'style|') {
//       out += ` style="${title.substr(6).replace(/"/g, '\'')}"`;
//     } else if (title && title.substr(0, 5) === 'right') {
//       out += ' style="float: right; margin 0 0 15px 15px;"';
//     } else if (title && title.substr(0, 4) === 'left') {
//       out += ' style="float: left; margin 0 15px 15px 0;"';
//     } else if (title) {
//       out += ` title="${title}"`;
//     }
//
//     out += this.options.xhtml ? '/>' : '>';
//     return out;
//   };
//
//   renderer.listitem = function (text, val) {
//     const valAttr = val ? ` value="${val}"` : '';
//     if (/^\s*\[[x ]\]\s*/.test(text)) {
//       text = text
//         .replace(/^\s*\[ \]\s*/, '<input type="checkbox" disabled> ')
//         .replace(/^\s*\[x\]\s*/, '<input type="checkbox" checked disabled> ');
//       return `<li style="list-style: none" class="checklist">${text}</li>`;
//     }
//
//     return `<li ${valAttr}>${text}</li>`;
//   };
//
//   renderer.table = function (header, body) {
//     return `${'<div class="marked-table"><table>\n<thead>\n'}${header}</thead>\n`
//      + `<tbody>\n${body}</tbody>\n</table></div>\n`;
//   };
//
//   renderer.heading = function (text, level, raw) {
//     const id = this.options.headerPrefix + raw.toLowerCase().replace(/[^\w]+/g, '-');
//
//     return `<h${
//     level
//     } class="header-scroll">` +
//     `<div class="anchor waypoint" id="section-${
//     id
//     }"></div>${
//     text
//     }<a class="fa fa-anchor" href="#section-${id}"></a>` +
//     `</h${
//     level
//     }>\n`;
//   };
//
//   renderer.link = function (href, title, text) {
//     const doc = href.match(/^doc:([-_a-zA-Z0-9#]*)$/);
//     let isDoc = false;
//     let uiSref = false;
//
//     if (href.match(/^(data|javascript)[^a-zA-Z0-9\/_-]/i)) { // Avoid XSS
//       href = '';
//     }
//
//     if (doc) {
//       uiSref = `docs.show({'doc': '${doc[1]}'})`;
//       href = '';
//       isDoc = doc[1];
//     }
//
//     const ref = href.match(/^ref:([-_a-zA-Z0-9#]*)$/);
//     if (ref) {
//       let cat = '';
//       if (req && req.project.appearance.categoriesAsDropdown) {
//         cat = `/${req._referenceCategoryMap[ref[1]]}`;
//       }
//       href = `/reference${cat}#${ref[1]}`;
//     }
//
//     const blog = href.match(/^blog:([-_a-zA-Z0-9#]*)$/);
//     if (blog) {
//       uiSref = `blog.show({'blog': '${blog[1]}'})`;
//       href = '';
//     }
//
//     const custompage = href.match(/^page:([-_a-zA-Z0-9#]*)$/);
//     if (custompage) {
//       uiSref = `custompages.show({'custompage': '${custompage[1]}'})`;
//     }
//
//     if (this.options.sanitize) {
//       let prot;
//       try {
//         prot = decodeURIComponent(unescape(href))
//         .replace(/[^\w:]/g, '')
//         .toLowerCase();
//       } catch (e) {
//         return '';
//       }
//       if (prot.indexOf('javascript:') === 0) { // eslint-disable-line no-script-url
//         return '';
//       }
//     }
//
//     let out = '<a';
//
//     out += ` href="${href}"`;
//
//     if (uiSref) {
//       out += ` ui-sref="${uiSref}"`;
//     } else {
//       // This prevents full links from getting
//       // into a weird AJAX state
//       out += ' target="_self"';
//     }
//
//     if (title) {
//       out += ` title="${title}"`;
//     }
//     if (isDoc) {
//       out += ` class="doc-link" data-sidebar="${isDoc}"`;
//     }
//     out += `>${text}</a>`;
//     return out;
//   };
//
//   const emojis = new Emoji();
//
//   marked.setOptions({
//     sanitize: true,
//     breaks: (req && req.project) ? !req.project.flags.correctnewlines : true,
//     preserveNumbering: true,
//     renderer,
//     emoji(emoji) {
//       emoji = emoji.replace(/[^-_+a-zA-Z0-9]/g, '').toLowerCase();
//       if (emoji.substr(0, 3) === 'fa-') {
//         return `<i class="fa ${emoji}"></i>`;
//       }
//       if (emojis.is(emoji)) {
//         return `<img src="/img/emojis/${emoji}.png" alt=":${emoji}+:" title=":${emoji}:" class="emoji" align="absmiddle" height="20" width="20">`;
//       }
//       return `:${emoji}:`;
//     },
//     highlight(code, language) {
//       if (!language) return undefined;
//       return syntaxHighlighter(code, language);
//     },
//     gfm: true,
//   });
//
//   const sanitizer = function (tag) {
//     // TODO: This is probably not secure enough; use html-sanatize when we move to the backend in hub2.
//     const tagName = tag.match(/<\/?([^>\s]+)/);
//
//     const allowedTags = [
//       'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span',
//       'blockquote', 'p', 'a', 'ul', 'ol', 'nl', 'li',
//       'b', 'i', 'strong', 'em', 'strike', 'code', 'hr',
//       'br', 'div', 'table', 'thead', 'caption', 'tbody',
//       'tr', 'th', 'td', 'pre', 'dl', 'dd', 'dt', 'sub', 'sup', 'section',
//     ];
//
//     const allowedAttrs = [
//       'class', 'id', 'style', 'cellpadding',
//       'cellspacing', 'width', 'align', 'height',
//       'colspan', 'href', 'name', 'target', 'src',
//       'title', 'alt',
//     ];
//
//     if (allowedTags.indexOf(tagName[1]) <= -1) {
//       return tag.replace('<', '&lt;').replace('>', '&gt;');
//     }
//
//     let tagClean = tagName[0]; // add the tag here
//     tag.replace(/\s+([a-zA-Z0-9]+)=('.*?'|".*?")/g, (full, attr) => {
//       if (allowedAttrs.indexOf(attr) > -1) {
//         tagClean += full;
//       }
//       return '';
//     });
//
//     return `${tagClean}>`;
//   };
//
//   return function (text, stripHTML) {
//     if (!text) return '';
//     marked.setOptions({
//       sanitizer: stripHTML ? undefined : sanitizer,
//     });
//     return marked(text);
//   };
// };
