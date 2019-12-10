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

Which gives you the following:

| Export        | Description                                    | Arguments        |
| -------------:|:---------------------------------------------- |:---------------- |
| *`react`*     |_default;_ returns a VDOM tree object           | `text`, `options`|
| *`html`*      | transform markdown in to HTML                  | `text`, `options`|
| *`ast`*       | transform markdown to an mdast object          | `text`, `options`|
| *`md`*        | transform mdast in to ReadMe-flavored markdown | `tree`, `options`|
| *`normalize`* | normalize magic block syntax pre-processing    | `text`           |
| *`utils`*     | default `options`, React contexts, other utils | N/A              |

## ReadMe-Flavored Syntax

Our old editor compiled custom "Magic Block" components in to a proprietary, JSON-based syntax. To provide seamless backwards-compatibility, the updated Markdown processor ships with built in support for parsing this magic blocks format and compiling it to a markdown-compatible syntax. Mostly this looks just like pure ol' markdown, but with a bit of syntactic sugar on top.

### Multi-Code Blocks

A tabbed interface for displaying multiple code blocks. These are written nearly identically to a series of vanilla markdown code snippets, except for the lack of an additional line separating each subsequent block:

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

<p align=center>which will render to:</p>

<p align=center><img src=docs/images/multi-code-block.png width=68% align=center></p>

### Callout Blocks

Callouts are very similar to blockquotes in both display and syntax. They are defined by an initial emoji, which determines the callout's theme:

    > ❗️ Watch Out
    > 
    > This is a callout using the error theme.

<p align=center>which renders as:</p>

<p align=center><img src=docs/images/callout.png width=75%></p>

There are four potential styles:

| Emoji Prefix | Callout Theme |
|:-----:|:------------|
|ℹ|info (blue theme)|
|👍|success (green theme)|
|⚠️|warning (orange theme)|
|❗️|danger (red theme)|

### Embedded Blocks

Embeds are written as links, with their title set to `@embed`:

    [Embed Title](https://youtu.be/8bh238ekw3 "@embed")

For now, embeds are rendered asynchronously in the user's browser.

### Other Blocks

<img src=docs/images/blocks-selector align=right width=154> Other magic blocks are rendered to pure markdown representations of their various contents. In these instances certain minor data loss (such as image widths) may occur, while new functionalities (such as table text alignment) will be gained.

## Updated Editor

Alongside the updates to our markdown parser, we're developing a new editor experience for ReadMe. You can [learn more about that project](https://github.com/readmeio/editor#readme-editor) at the link.

## Credits

- **Lisence**: ISC
- **Authors**: [Dom Harrington](https://github.com/domharrington/), [Rafe Goldberg](https://github.com/rafegoldberg)
