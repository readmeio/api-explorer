<img align=right width=26% src=http://owlbert.io/images/owlberts-png/Reading.psd.png>

@ReadMe Markdown
===

A [Unified](https://github.com/unifiedjs)-based Markdown parser for ReadMe:

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

<hr><details>
<summary><b>Named Exports</b></summary>

---

In addition to the default React processor, the package exports a few other methods for transforming ReadMe-flavored markdown:

```jsx
import * as rdmd from "@readme/markdown";
```

Which will give you the following:

| Export        | Description                                    | Arguments        |
| -------------:|:---------------------------------------------- |:---------------- |
| *`react`*     |_default;_ returns a VDOM tree object           | `text`, `options`|
| *`html`*      | transform markdown in to HTML                  | `text`, `options`|
| *`ast`*       | transform markdown to an mdast object          | `text`, `options`|
| *`md`*        | transform mdast in to ReadMe-flavored markdown | `tree`, `options`|
| *`normalize`* | normalize magic block syntax pre-processing    | `text`           |
| *`utils`*     | default `options`, React contexts, other utils | N/A              |

</details><hr>

## ReadMe-Flavored Syntax

Our old editor compiled custom "Magic Block" components in to a JSON-based syntax. To provide seamless backwards-compatibility, the updated Markdown processor ships with built in support for parsing this proprietary format and compiling it to a markdown-compatible syntax. Mostly this looks just like pure ol' markdown, but with a bit of syntactic sugar on top.


### Standard Markdown Components

Most of our magic blocks render neatly to pure markdown representations. In some instances certain minor data loss will occur (such as our "smart" image sizing), while new functionalities (such as table text alignment) will be gained. These components include:

- [Image Blocks](http://md-edit-test.readme-stage-pr-2116.readme.ninja/docs/images)
- [List Blocks](http://md-edit-test.readme-stage-pr-2116.readme.ninja/docs/lists)
- [Table Blocks](http://md-edit-test.readme-stage-pr-2116.readme.ninja/docs/tables)
- [Heading Blocks](http://md-edit-test.readme-stage-pr-2116.readme.ninja/docs/headings)
- Inline Decorations (link, bold, and emphasis tags, etc)

### ReadMe-Flavored Components

#### Multi-Code Blocks [**↗**](http://md-edit-test.readme-stage-pr-2116.readme.ninja/docs/code-blocks "Code Blocks Demo")

() A tabbed interface for displaying multiple code blocks. These are written nearly identically to a series of vanilla markdown code snippets, except for their distinct *lack* of an additional line break separating each subsequent block:

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

#### Callout Blocks [**↗**](http://md-edit-test.readme-stage-pr-2116.readme.ninja/docs/callouts "Callouts Demo")

Callouts are very similar to blockquotes in both display and syntax. They are defined by a title with an initial emoji, which determines the callout's theme:

    > ❗️ Watch Out
    > 
    > This is a callout using the error theme.

There are five potential themes:

| Emoji Prefix | Callout Theme |
|:-----:|:------------|
|ℹ|`.info` (blue theme)|
|👍|`.okay` (green theme)|
|⚠️|`.warn` (orange theme)|
|❗️|`.error` (red theme)|
|*...rest*|`N/A` (gray theme)|

#### Embedded Blocks [**↗**](http://md-edit-test.readme-stage-pr-2116.readme.ninja/docs/embeds "Embeds Demo")

Embeds are written as links, with their title set to `@embed`:

    [Embed Title](https://youtu.be/8bh238ekw3 "@embed")

## Updated Editor

Alongside the updates to our markdown parser, we're developing a new editor experience for ReadMe. You can [learn more about that project](https://github.com/readmeio/editor#readme-editor) at the link.

## Credits

- **Lisence**: ISC
- **Authors**: [Dom Harrington](https://github.com/domharrington/), [Rafe Goldberg](https://github.com/rafegoldberg)
