import { createHyperscript } from 'slate-hyperscript'

const h = createHyperscript({
  blocks: {
    paragraph: 'paragraph',
    image: 'image',
  },
  inlines: {
    link: 'link',
  },
  marks: {
    b: 'bold',
  },
})

const value = (
  <value>
    <document>
      <paragraph>
        A string of <b>bold</b> in a <link src="http://slatejs.org">Slate</link>{' '}
        editor!
      </paragraph>
      <image src="https://..." />
    </document>
  </value>
)
