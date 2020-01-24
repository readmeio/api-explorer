/* eslint-disable consistent-return */
const RGXP = /^\[block:(.*)\]([^]+?)\[\/block\]/;

const WrapPinnedBlocks = (node, json) => {
  if (!json.sidebar) return node;
  return {
    children: [node],
    type: 'rdme-pin',
    data: {
      hName: 'rdme-pin',
      className: 'pin',
    },
  };
};

function tokenize(eat, value) {
  let [match, type, json] = RGXP.exec(value) || [];

  if (!type) return;

  match = match.trim();
  type = type.trim();
  json = (json && JSON.parse(json)) || {};

  switch (type) {
    case 'code': {
      const children = json.codes.map(obj => ({
        type: 'code',
        value: obj.code,
        meta: obj.name || null,
        lang: obj.language,
        className: 'tab-panel',
        data: {
          hName: 'code',
          hProperties: {
            meta: obj.name || null,
            lang: obj.language,
          },
        },
      }));
      if (children.length === 1) return eat(match)(WrapPinnedBlocks(children[0], json));
      return eat(match)(
        WrapPinnedBlocks(
          {
            children,
            className: 'tabs',
            data: { hName: 'code-tabs' },
            type: 'code-tabs',
          },
          json
        )
      );
    }
    case 'api-header': {
      return eat(match)(
        WrapPinnedBlocks(
          {
            type: 'heading',
            depth: json.level || 2,
            children: this.tokenizeInline(json.title, eat.now()),
          },
          json
        )
      );
    }
    case 'image': {
      return eat(match)(
        WrapPinnedBlocks(
          json.images.map(img => {
            const [url, title] = img.image;
            return {
              type: 'image',
              url,
              title,
              alt: img.caption,
              data: {
                hProperties: {
                  caption: img.caption,
                },
              },
            };
          })[0],
          json
        )
      );
    }
    case 'callout': {
      json.type = {
        info: ['ℹ', 'info'],
        success: ['👍', 'okay'],
        warning: ['⚠️', 'warn'],
        danger: ['❗️', 'error'],
      }[json.type];
      const [icon, theme] = json.type;
      return eat(match)(
        WrapPinnedBlocks(
          {
            type: 'rdme-callout',
            data: {
              hName: 'rdme-callout',
              hProperties: {
                theme: theme || 'default',
                icon,
                title: json.title,
                value: json.body,
              },
            },
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', value: `${icon} ` }, ...this.tokenizeInline(json.title, eat.now())],
              },
              ...this.tokenizeBlock(json.body, eat.now()),
            ],
          },
          json
        )
      );
    }
    case 'parameters': {
      const { data } = json;
      const children = Object.keys(data)
        .sort()
        .reduce((sum, key) => {
          const val = data[key];
          let [row, col] = key.split('-');
          row = row === 'h' ? 0 : parseInt(row, 10) + 1;
          col = parseInt(col, 10);

          sum[row] = sum[row] || { type: 'tableRow', children: [] };

          sum[row].children[col] = {
            type: row ? 'tableCell' : 'tableHead',
            children: this.tokenizeInline(val, eat.now()),
          };
          // convert falsey values to empty strings
          sum[row].children = [...sum[row].children].map(v => v || '');
          return sum;
        }, []);
      const table = {
        type: 'table',
        align: 'align' in json ? json.align : new Array(json.cols).fill('left'),
        children: children.filter(v => v || false),
      };
      return eat(match)(WrapPinnedBlocks(table, json));
    }
    case 'embed': {
      json.title = json.title || 'Embed';
      const { title, url, html } = json;
      json.provider = `@${new URL(url).hostname
        .split(/(?:www)?\./)
        .filter(i => i)
        .join('')}`;
      const data = { url, html, title, provider: json.provider };
      return eat(match)(
        WrapPinnedBlocks(
          {
            type: 'embed',
            ...data,
            children: [
              {
                type: 'link',
                url,
                title: json.provider,
                children: [{ type: 'text', value: title }],
              },
            ],
            data: {
              ...data,
              hProperties: { ...data, href: url },
              hName: 'rdme-embed',
            },
          },
          json
        )
      );
    }
    default: {
      return eat(match)(
        WrapPinnedBlocks(
          {
            type: 'div',
            children: this.tokenizeBlock(json.text || json.html, eat.now()),
            data: json,
          },
          json
        )
      );
    }
  }
}

function parser() {
  const { Parser } = this;
  const tokenizers = Parser.prototype.blockTokenizers;
  const methods = Parser.prototype.blockMethods;

  tokenizers.magicBlocks = tokenize;
  methods.splice(methods.indexOf('newline'), 0, 'magicBlocks');
}

module.exports = parser;

module.exports.sanitize = sanitizeSchema => {
  // const tags = sanitizeSchema.tagNames;
  const attr = sanitizeSchema.attributes;
  attr.li = ['className', 'checked'];
  attr.pre = ['className', 'lang', 'meta'];
  attr.code = ['className', 'lang', 'meta'];
  attr.table = ['align'];

  return parser;
};
