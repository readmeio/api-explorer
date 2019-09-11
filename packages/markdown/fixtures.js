module.exports = `# ReadMe Flavored Markdown

[block:api-header]
{
  "title": "ReadMe MagicBlock Conversion",
  "level": 2
}
[/block]

[block:callout]
{
  "type": "success",
  "title": "YES",
  "body": "Lorem ipsum dolor sit amet, _consectetur_ adipiscing elit. Praesent nec massa tristique arcu fermentum dapibus. Integer orci turpis, mollis vel augue eget, placerat rhoncus orci. Mauris metus libero, rutrum"
}
[/block]

[block:callout]
{
  "type": "info",
  "title": "OK",
  "body": "Lorem ipsum dolor sit amet, _consectetur_ adipiscing elit. Praesent nec massa tristique arcu fermentum dapibus. Integer orci turpis, mollis vel augue eget, placerat rhoncus orci. Mauris metus libero, rutrum"
}
[/block]

[block:callout]
{
  "type": "warning",
  "title": "WARN",
  "body": "Lorem ipsum dolor sit amet, _consectetur_ adipiscing elit. Praesent nec massa tristique arcu fermentum dapibus. Integer orci turpis, mollis vel augue eget, placerat rhoncus orci. Mauris metus libero, rutrum"
}
[/block]

[block:callout]
{
  "type": "danger",
  "title": "UHOH",
  "body": ""
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "$http.post('/someUrl', data).success(successCallback);\\n\\nalert('test');",
      "language": "javascript"
    },
    {
      "code": "second tab",
      "language": "text",
      "name": "custom title"
    }
  ]
}
[/block]

### Code Samples

\`\`\`php
<?
echo "Hello world!";
?>
\`\`\`
\`\`\`javascript
window.load(function(){
  console.log('Hello world!')
});
\`\`\`

### Images

![alt](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo%20Title%20Text%201")


### Blockquotes

> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent nec massa tristique arcu fermentum dapibus. Integer orci turpis, mollis vel augue eget, placerat rhoncus orci. Mauris metus **libero**, rutrum eu ornare ut, molestie vel nunc. Morbi sed iaculis metus.

### Tables

| Col 1 | Col 2 | Col 3 | Col 4 |
|:--- |:--- |:--- |:--- |
| \`R1\`,\`C1\` | \`R1\`,\`C2\` | \`R1\`,\`C3\` | \`R1\`,\`C4\` |
| \`R2\`,\`C1\` | \`R2\`,\`C2\` | \`R2\`,\`C3\` | \`R2\`,\`C4\` |

### Formatted Text

This text is **bold**. This is _italic_. This is an \`inline code block\`. You can use those formatting rules in tables, paragraphs, lists, wherever (although they'll appear verbatim in code blocks.)

### Lists

#### Ordered Lists

1. This
2. Is An
3. Ordered
4. List

#### To Do Lists

- [ ] This
- [x] Is A
- [ ] To Do
- [x] List

#### Unordered Lists

* This is a
* Bulleted list

### Links

This is an [internal link](#error-code-definitions), this is an [external link](http://google.com).`;