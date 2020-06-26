<img align=right width=26% src=http://owlbert.io/images/owlberts-png/Reading.psd.png>

@readme/markdown
===

A [Unified](https://github.com/unifiedjs)-based Markdown parser for ReadMe. [![Build](https://github.com/readmeio/api-explorer/workflows/CI/badge.svg)](https://github.com/readmeio/api-explorer/tree/master/packages/markdown)

```
npm install --save @readme/markdown
```

## Usage

By default, the updated markdown package exports a function which takes a string of [ReadMe-flavored markdown](#readme-flavored-syntax) and returns a tree of React components:

```jsx
import React from 'react';
import rdmd from "@readme/markdown";

export default ({ body }) => (
  <div className="markdown-body">
    {rdmd(body)}
  </div>
);
```

### Export Methods

In addition to the default processor, the package exports some other methods for transforming ReadMe-flavored markdown:

| Export  | Description                                    | Arguments       |
| -------:|:---------------------------------------------- |:--------------- |
|*`react`*|(default) returns a VDOM tree object            |`text`, `options`|
|*`md`*   | transform mdast in to ReadMe-flavored markdown |`tree`, `options`|
|*`html`* | transform markdown in to HTML                  |`text`, `options`|
|*`mdast`*| transform markdown to an mdast object          |`text`, `options`|
|*`hast`* | transform markdown to HAST object              |`text`, `options`|
|*`plain`*| transform markdown to plain text               |`text`, `options`|
|*`utils`*| contexts, defaults, helpers, etc.              | N/A             |

#### Settings & Options

Each processor method takes an options object, which you can use to customize various outputs. Among them

- **`markdownOptions`**: [Remark parsing options](https://github.com/remarkjs/remark/tree/main/packages/remark-stringify#processorusestringify-options)
- **`correctnewlines`**: render new line delimeters as `<br>` tags.
- **`compatibilityMode`**: [enable compatibility features for ReadMe's old markdown engine](https://github.com/readmeio/api-explorer/issues/668).

## Flavored Syntax

Our old editor compiled custom "Magic Block" components from a JSON-based syntax. To provide seamless backwards-compatibility, the updated Markdown processor ships with built in support for parsing this old format and transpiling it in to standard, GitHub-flavored markdown. We've also sprinkled a bit of our own syntactic sugar on top, which let's you supercharge your docs. [**Read more about ReadMe's flavored syntax!**](https://rdmd.readme.io)

## Credits

- **Lisence**: ISC
- **Authors**: [Dom Harrington](https://github.com/domharrington/), [Rafe Goldberg](https://github.com/rafegoldberg)
