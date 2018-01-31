function sanitizer(tag) {
  // TODO: This is probably not secure enough; use html-sanatize when we move to the backend in hub2.
  const tagName = tag.match(/<\/?([^>\s]+)/);

  const allowedTags = [
    'img',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'span',
    'blockquote',
    'p',
    'a',
    'ul',
    'ol',
    'nl',
    'li',
    'b',
    'i',
    'strong',
    'em',
    'strike',
    'code',
    'hr',
    'br',
    'div',
    'table',
    'thead',
    'caption',
    'tbody',
    'tr',
    'th',
    'td',
    'pre',
    'dl',
    'dd',
    'dt',
    'sub',
    'sup',
    'section',
  ];

  const allowedAttrs = [
    'class',
    'id',
    'style',
    'cellpadding',
    'cellspacing',
    'width',
    'align',
    'height',
    'colspan',
    'href',
    'name',
    'target',
    'src',
    'title',
    'alt',
  ];

  if (allowedTags.indexOf(tagName[1]) <= -1) {
    return tag.replace('<', '&lt;').replace('>', '&gt;');
  }

  let tagClean = tagName[0]; // add the tag here
  tag.replace(/\s+([a-zA-Z0-9]+)=('.*?'|".*?")/g, (full, attr) => {
    if (allowedAttrs.indexOf(attr) > -1) {
      tagClean += full;
    }
    return '';
  });

  return `${tagClean}>`;
}

module.exports = sanitizer;
