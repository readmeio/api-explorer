<img align=right width=26% src=http://owlbert.io/images/owlberts-png/Reading.psd.png>

@readme/markdown
===

A [Unified](https://github.com/unifiedjs)-based Markdown parser for ReadMe. [![Build](https://github.com/readmeio/api-explorer/workflows/CI/badge.svg)](https://github.com/readmeio/api-explorer/tree/master/packages/markdown) [![Build](https://github.com/readmeio/api-explorer/workflows/CI/badge.svg)](https://github.com/readmeio/api-explorer/tree/master/packages/markdown)

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

## Custom Syntax

Our old editor compiled custom "Magic Block" components from a JSON-based syntax. To provide seamless backwards-compatibility, the updated Markdown processor ships with built in support for parsing this old format and transpiling it in to standard, GitHub-flavored markdown. We've also sprinkled a bit of our own syntactic sugar on top, which let's you supercharge your docs.

<details>
  <summary><b>Standard Markdown</b></summary><br>

- images
- lists
- tables
- headings
- inline decorations (link, bold, and emphasis tags, etc)

</details>
<details>
  <summary><b>Code Tabs</b></summary><br>

A tabbed interface for displaying multiple code blocks. These are written nearly identically to a series of vanilla markdown code snippets, except for their distinct *lack* of an additional line break separating each subsequent block:

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

</details>

<details>
  <summary><b>Callouts</b></summary><br>

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

</details>
<details>
  <summary><b>Embeds</b></summary><br>

Embeds are written as links, with their title set to `@embed`:

    [Embed Title](https://youtu.be/8bh238ekw3 "@embed")

</details>

## CSS Selectors

By and large, the new markdown processor outputs standard HTML. This means most basic CSS element selectors will continue to work seamlessly! You'll only need to update your custom styles for ReadMe-flavored markdown components (see below.) When writing custom styles for the new processor make sure to use this class prefix so your CSS doesn't bleed:

```css
#api-explorer .markdown-body .callout {}
```

<details>
  <summary><b>Callouts</b></summary><br>

Customize the default callout theme:

```scss
#api-explorer .markdown-body .callout {
  background: lightblue;
  border-color: dodgerblue;
}
```

Override the built-in theme styles:

```scss
#api-explorer .markdown-body .callout {}       // gray (default)
#api-explorer .markdown-body .callout_info {}  // blue
#api-explorer .markdown-body .callout_okay {}  // green
#api-explorer .markdown-body .callout_warn {}  // orange
#api-explorer .markdown-body .callout_error {} // red
```

</details>

<details>
  <summary><b>Tables</b></summary><br>

Tables are no longer wrapped in extra divs, and have a simplified baseline display that more closely mirrors standard markdown implementations. They should be easier to style.

```css
#api-explorer .markdown-body table {}
#api-explorer .markdown-body tr {}
#api-explorer .markdown-body th {}
#api-explorer .markdown-body td {}
```

</details>

## Updated Editor

Alongside the updates to our markdown parser, we're developing a new editor experience for ReadMe. You can [learn more about that project](https://github.com/readmeio/editor#readme-editor) at the link.

## Credits

- **Lisence**: ISC
- **Authors**: [Dom Harrington](https://github.com/domharrington/), [Rafe Goldberg](https://github.com/rafegoldberg)
