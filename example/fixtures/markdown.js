const table = ['FIX TABLE MDAST SERIALIZER RULE/UNIFIED REMARK COMPILER', `|Foo|Bar|
|:-:|---|
|Baz|Qux|`];

module.exports = {

  simplified: `# Markdown Test

Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste quos quaerat harum ducimus. Quod laborum earum, amet voluptatum quos maiores deserunt officia voluptate repudiandae eum ex facere unde iusto, similique quasi ducimus, veniam sapiente cum. Voluptates distinctio expedita magnam ullam in fugit veritatis nisi voluptas at aspernatur reiciendis, nobis odio quia ipsa omnis delectus et?

## Section 1

Quisquam, quia nisi exercitationem vel natus expedita reiciendis quis quos soluta laborum ex distinctio nam excepturi maxime laboriosam velit possimus cumque hic dolores aliquam? Incidunt ullam numquam minima quis amet. Officiis, ducimus modi. Nostrum repellat modi cupiditate dolor magni illo est, sit iure vel suscipit? Nostrum expedita quam voluptatibus error porro, vel a eum et?

###### Sub-Section A

Dolor dolore aut animi ea praesentium iusto sit quod autem, ad architecto esse. Quidem, eum culpa. Sequi porro neque iusto ullam odit cum in dolore inventore enim atque, aliquam eius magni ut cupiditate magnam illo id exercitationem molestias repudiandae totam. Harum possimus vitae alias dolor pariatur nobis minima! Iste reiciendis laudantium, commodi hic ipsa porro.

###### Sub-Section B

Autem error fugiat molestias magnam quam minus molestiae quasi nobis vel exercitationem cum recusandae doloribus ab aspernatur libero dolor qui tenetur, corrupti aliquid facilis dolores. Totam, molestias similique. Modi perferendis explicabo quaerat maxime vel, molestias aspernatur cumque inventore beatae ut recusandae, placeat quas commodi, eum ipsa velit fugiat eius. Voluptates ad voluptatum atque. Illo, assumenda!

Maiores, expedita doloribus tempore at dolorem odit nisi temporibus. Debitis ea, impedit eligendi maxime reprehenderit qui maiores soluta blanditiis deleniti numquam illo, alias a sapiente eveniet voluptatibus ipsam quaerat facere architecto! Atque, deserunt harum odit officia aut voluptates repellat, rerum necessitatibus totam ex veritatis numquam. Enim commodi quas earum atque. Repellat qui quae deleniti veniam?`,

  magicBlocks: `# ReadMe Flavored Markdown

[block:api-header]
{
  "title": "ReadMe MagicBlock Conversion",
  "level": 2
}
[/block]

[block:callout]
{
  "type": "success",
  "title": "Callout Title",
  "body": "Lorem ipsum dolor sit amet, _consectetur_ adipiscing elit. Praesent nec massa tristique arcu fermentum dapibus. Integer orci turpis, mollis vel augue eget, placerat rhoncus orci. Mauris metus libero, rutrum"
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

[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/62083ee-White_Center_Blue_BG.svg",
        "White Center Blue BG.svg",
        240,
        150,
        "#000000"
        ],
      "caption": "Qui iusto fugiat doloremque? Facilis obcaecati vitae corrupti.",
      "sizing": "80",
      "border": true
    }
  ]
}
[/block]

## Standard Markdown

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

${table[1]}

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

This is an [internal link](#error-code-definitions), this is an [external link](http://google.com).

### Various

#### Horizontal Rule

---
`,
};
