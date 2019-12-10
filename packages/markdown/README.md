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

Our old editor compiled custom "Magic Block" components in to a JSON-based syntax. To provide seamless backwards-compatibility, the updated Markdown processor ships with built in support for parsing this proprietary format and compiling it to a markdown-compatible syntax. Mostly this looks just like pure ol' markdown, but with a bit of syntactic sugar on top.

### [Multi-Code Blocks](http://md-edit-test.readme-stage-pr-2116.readme.ninja/docs/code-blocks)

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

Wwhich will render to:

<p align=center><img src=docs/images/multi-code-block.png width=68% align=center></p>

### [Callout Blocks](http://md-edit-test.readme-stage-pr-2116.readme.ninja/docs/callouts)

Callouts are very similar to blockquotes in both display and syntax. They are defined by an initial emoji, which determines the callout's theme:

    > ❗️ Watch Out
    > 
    > This is a callout using the error theme.

Which renders as:

<p align=center><img src=docs/images/callout.png width=75%></p>

There are four potential styles:

| Emoji Prefix | Callout Theme |
|:-----:|:------------|
|ℹ|info (blue theme)|
|👍|success (green theme)|
|⚠️|warning (orange theme)|
|❗️|danger (red theme)|

### [Embedded Blocks](http://md-edit-test.readme-stage-pr-2116.readme.ninja/docs/embeds)

Embeds are written as links, with their title set to `@embed`:

    [Embed Title](https://youtu.be/8bh238ekw3 "@embed")

For now, embeds are rendered asynchronously in the user's browser.


<img src=docs/images/blocks-selector.jpg align=left width=180>

### Other Blocks

Other magic blocks are rendered to pure markdown representations of their various contents. In some instances certain minor data loss (such as image "smart sizing") may occur, while new functionalities (such as table text alignment) will be gained. These pure converters include:

- [Image Blocks](http://md-edit-test.readme-stage-pr-2116.readme.ninja/docs/images)
- [List Blocks](http://md-edit-test.readme-stage-pr-2116.readme.ninja/docs/lists)
- [Table Blocks](http://md-edit-test.readme-stage-pr-2116.readme.ninja/docs/tables)
- [Heading Blocks](http://md-edit-test.readme-stage-pr-2116.readme.ninja/docs/headings)

## Updated Editor

Alongside the updates to our markdown parser, we're developing a new editor experience for ReadMe. You can [learn more about that project](https://github.com/readmeio/editor#readme-editor) at the link.

## Credits

- **Lisence**: ISC
- **Authors**: [Dom Harrington](https://github.com/domharrington/), [Rafe Goldberg](https://github.com/rafegoldberg)
