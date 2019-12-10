<img align=right width=25% src=http://owlbert.io/images/owlberts-png/Reading.psd.png>

@ReadMe Markdown
===

ReadMe's React-based Markdown parser

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

## ReadMe-Flavored Syntax

Our old editor compiled custom components, called "magic blocks", in to a custom JSON-based syntax. To provide seamless backwards-compatibility, the updated Markdown processor ships with built in support for parsing this magic block format and compiling it to a markdown-compatible syntax. In the main, this looks like pure markdown, with a few additional options:

### Multi-Code Blocks

A tabbed interface for displaying multiple code blocks. These are written nearly identically to two plain markdown code blocks, except for the lack of an additional line break between them:

    ```javascript
    export sum from 'sum';
    export sub from 'sub';
    ```
    ```javascript sum.js
    export sum = (a, b) => a + b
    ```
    ```javascript sub.js
    export sub = (a, b) => a - b
    ```

Which will render as:

<p align=center><img src=docs/images/multi-code-block.png width=68% align=center></p>

### Callout Blocks

Callouts are very similar to blockquotes in both display and syntax. They are defined by an initial emoji, which determines the callout's theme:

    > ❗️ Watch Out
    > 
    > This is a callout using the error theme.

Which will renders as:

<p align=center><img src=docs/images/callout.png width=75%></p>

There are four potential styles:

| Emoji | Theme Style |
|:-----:|:------------|
|ℹ|info (blue theme)|
|👍|success (green theme)|
|⚠️|warning (orange theme)|
|❗️|danger (red theme)|

### Embedded Content

Embeds are written as links, with their title set to `@embed`:

    [Embed Title](https://youtu.be/8bh238ekw3 "@embed")

For now, embeds are rendered asynchronously in the user's browser.

## Credits

- **Lisence**: ISC
- **Authors**: [Dom Harrington](https://github.com/domharrington/), [Rafe Goldberg](https://github.com/rafegoldberg)
