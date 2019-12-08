<img align=right width=25% src=http://owlbert.io/images/owlberts-png/Reading.psd.png>

@ReadMe Markdown
===

[![Build](https://github.com/readmeio/api-explorer/workflows/CI/badge.svg)](https://github.com/readmeio/api-explorer/tree/master/packages/markdown)

[![](https://d3vv6lp55qjaqc.cloudfront.net/items/1M3C3j0I0s0j3T362344/Untitled-2.png)](https://readme.io)

## Installation

```
npm install --save @readme/markdown
```

## Usage

By default, the updated markdown package exports a function which takes a string of [ReadMe-flavored markdown](https://paper.dropbox.com/doc/Magic-to-Markdown--AqDGfp1VbZ0vi8c6Wk7~31HiAQ-8cjE2igxdlRPpb5ywZrha) and returns a tree of React components:

```jsx
import React from 'react';
import rdmd from "@readme/markdown";

export default ({ body }) => (
  <div className="markdown-body">
    {rdmd(body)}
  </div>
);
```

In addition to the default React processor, the package exports a few other methods for transforming ReadMe-flavored markdown:

```jsx
import * as rdmd from "@readme/markdown";
```

Which will give you:

| `rdmd`[*`key`*] | Description                                    | Arguments        |
| ---------------:|:---------------------------------------------- |:---------------- |
| *`html`*        | transform markdown in to HTML                  | `text`, `options`|
| *`ast`*         | transform markdown to an mdast object          | `text`, `options`|
| *`md`*          | transform mdast in to ReadMe-flavored markdown | `tree`, `options`|
| *`utils`*       | default options; various utility methods       | N/A              |

## Credits
[Dom Harrington](https://github.com/domharrington/), [Rafe Goldberg](https://github.com/rafegoldberg)

## License

ISC
