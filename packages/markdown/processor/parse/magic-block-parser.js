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

const imgSizeRemap = {
  full: '100%',
  original: 'auto',
};

function tokenize(eat, value) {
  let [match, type, json] = RGXP.exec(value) || [];

  if (!type) return;

  match = match.trim();
  type = type.trim();
  try {
    json = JSON.parse(json);
  } catch (err) {
    json = {};
    // eslint-disable-next-line no-console
    console.error('Invalid Magic Block JSON:', err);
  }

  if (Object.keys(json).length < 1) return eat(match);

  switch (type) {
    case 'code': {
      const children = json.codes.map(obj => ({
        type: 'code',
        value: obj.code.trim(),
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
      if (children.length === 1) {
        if (!children[0].value) return eat(match); // skip empty code tabs
        if (children[0].name) return eat(match)(WrapPinnedBlocks(children[0], json));
      }
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
            children: 'title' in json ? this.tokenizeInline(json.title, eat.now()) : '',
          },
          json
        )
      );
    }
    case 'image': {
      const imgs = json.images.map(img => {
        const [url, title] = img.image;
        const size = img.sizing;

        const block = {
          type: 'image',
          url,
          title,
          data: {
            hProperties: {
              className: img.border ? 'border' : '',
              width: size && !size.match(/\D/) ? `${size}%` : imgSizeRemap[size] || size,
            },
          },
        };

        if (!img.caption) return block;

        return {
          type: 'figure',
          url,
          data: { hName: 'figure' },
          children: [
            block,
            {
              type: 'figcaption',
              data: { hName: 'figcaption' },
              children: this.tokenizeBlock(img.caption, eat.now()),
            },
          ],
        };
      });
      const img = imgs[0];

      if (!img.url) return eat(match);
      return eat(match)(WrapPinnedBlocks(img, json));
    }
    case 'callout': {
      const types = {
        info: ['📘', 'info'],
        success: ['👍', 'okay'],
        warning: ['🚧', 'warn'],
        danger: ['❗️', 'error'],
      };
      json.type = json.type in types ? types[json.type] : [json.icon || '👍', json.type];
      const [icon, theme] = json.type;
      if (!(json.title || json.body)) return eat(match);
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

      if (!Object.keys(data).length) return eat(match); // skip empty tables

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
        children: children.filter(v => v || ' '),
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
      const data = {
        url,
        html,
        title,
        provider: json.provider,
        height: json.height,
        width: json.width,
        iframe: json.iframe,
      };
      return eat(match)(
        WrapPinnedBlocks(
          {
            type: 'embed',
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
    case 'html': {
      return eat(match)(
        WrapPinnedBlocks(
          {
            type: 'html-block',
            data: { hName: 'html-block', hProperties: { html: json.html } },
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
