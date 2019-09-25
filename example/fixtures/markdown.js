const table = [
  '',
  `|Foo|Bar|
|:-:|---|
|Baz|Qux|`];

const codeBlocks = [
  '```javascript\nwindow.load(e => {\n\tconsole.log("hello world");\n});\n```\n```php test-script.php\n$name = "world";\necho "hello $name");\n```',
  '```javascript\nwindow.load(e => {\n\tconsole.log("hello world");\n});\n```\n\n```php test-script.php\n$name = "world";\necho "hello $name");\n```',
  `\`\`\`php
  $name = 'World';
  echo "Hello {$name}!";
  \`\`\`
  \`\`\`javascript test.js
  window.load(function(){
    console.log('Hello world!')
  });
  \`\`\`
  
  \`\`\`scss style.scss
  .root {
    $b: #{&};
    &-elem {
      color: red;
      #{$b}_on & {
        color: green;
      }
    }
  }
  \`\`\`
  `,
];

module.exports = {

  simplified: `# Markdown Test

Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste quos quaerat harum ducimus. Quod laborum earum, amet voluptatum quos maiores deserunt officia voluptate repudiandae eum ex facere unde iusto, similique quasi ducimus, veniam sapiente cum. Voluptates distinctio expedita magnam ullam in fugit veritatis nisi voluptas at aspernatur reiciendis, nobis odio quia ipsa omnis delectus et?

## Section 1

${codeBlocks[2]}

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
  "body": "Lorem ipsum dolor sit amet, _consectetur_ adipiscing elit. Praesent nec **massa** tristique arcu fermentum dapibus. Integer \`orci\` turpis, mollis vel augue eget, placerat rhoncus orci. Mauris metus libero, rutrum."
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "window.load(function(){\\n  console.log('Hello world!')\\n});",
      "language": "javascript"
    },
    {
      "code": "$name = 'World';\\necho \\"Hello {$name}!\\";",
      "language": "php",
      "name": "say-hello.php"
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

## ReadMe Flavored Markdown

### Adjacent Code Samples

\`\`\`php
$name = 'World';
echo "Hello {$name}!";
\`\`\`
\`\`\`javascript test.js
window.load(function(){
  console.log('Hello world!')
});
\`\`\`

\`\`\`scss style.scss
.root {
  $b: #{&};
  &-elem {
    color: red;
    #{$b}_on & {
      color: green;
    }
  }
}
\`\`\`

## Standard Markdown

### Subsequent Code Samples

\`\`\`javascript test.js
window.load(function(){
  console.log('Hello world!')
});
\`\`\`

\`\`\`php
$name = 'World';
echo "Hello {$name}!";
\`\`\`

### Images

![Alt text](https://edit.co.uk/uploads/2016/12/Image-2-Alternatives-to-stock-photography-Thinkstock.jpg (image-title, right, 50%, auto))

### Blockquotes

> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent nec massa tristique arcu fermentum dapibus. Integer orci turpis, mollis vel augue eget, placerat rhoncus orci. Mauris metus **libero**, rutrum eu ornare ut, molestie vel nunc. Morbi sed iaculis metus.

### Text Formatting

This text is **bold**. This text is [linked](http://google.com). This is _italic_. This is an \`inline code block\`. You can use those formatting rules in tables, paragraphs, lists, wherever (although they'll appear verbatim in code blocks.)

### Lists

#### Ordered Lists

1. This
2. Is An
3. Ordered
4. List

#### Unordered Lists

* This is a
* Bulleted list

### Sectioning

#### Headings

> ###### Heading 6
> ##### Heading 5
> #### Heading 4
> ### Heading 3
> ## Heading 2
> # Heading 1

#### Horizontal Rule

---

## GitHub Flavored Markdown

### Tables

|Foo|Bar|
|:-:|---|
|Baz|Qux|

### To Do Lists

- [ ] This
- [x] Is A
- [ ] To Do
- [x] List
`,
};
