/* eslint-disable */
import React, {Component} from 'react';

import Block from '../index';
import {rules} from '../../rules.mdast';


const slateFocusFix = event => event.preventDefault() | event.stopPropagation();


class SlashSearch extends Component {
  constructor(props) {
    super(props);

    this.editor = this.props.editor;

    this.state = {
      results: [],
      matches: {
        'paragraph|plain|text': 'paragraph',
        'h1|#1|heading 1': 'h1',
        'h2|#2|heading 2': 'h2',
        'h3|#3|heading 3': 'h3',
        'h4|#4|heading 4': 'h4',
        'h5|#5|heading 5': 'h5',
        'h6|#6|heading 6': 'h6',
        'code block|codeblock|code': 'code',
        'blockquote|quote': 'blockquote',
        'img|photo|picture': 'image',
        'bulleted list|unordered list': 'unorderedList',
        'numbered list|ordered list': 'orderedList',
      },
      resultKeys: {
        'h1':            'Heading 1',
        'h2':            'Heading 2',
        'h3':            'Heading 3',
        'h4':            'Heading 4',
        'h5':            'Heading 5',
        'h6':            'Heading 6',
        'code':          'Code Block',
        'blockquote':    'Blockquote',
        'image':         'Image',
        'unorderedList': 'Unordered List',
        'orderedList':   'Ordered List',
        'paragraph':     'Paragraph Text',
      }
    };
  }
  componentDidMount(){
    this.field.focus();
  }
  blurHandler(event) {
    this.dropdown.classList.add('dropdown_hidden')
  }
  focusHandler(event) {
    this.dropdown.classList.remove('dropdown_hidden');
    this.setState({results: Object.values(this.state.matches)});
  }
  changeHandler(event) {
    const {target} = event;
    const value = target.value;
    this.setState({
      results: Object.keys(this.state.matches)
        .filter(search => search.indexOf(value) >= 0)
        .map((key, i, og) => this.state.matches[key]),
    });
  }
  convertBlock(blockType){
    const blocks = {
      unorderedList: 'list-item',
      orderedList: {
        type: 'list',
        nodes: [{
          type: 'list-item',
          nodes: [{type: 'text', value: 'list item'}],
          data: {checked: false},
        }]
      }
    };

    this.editor.setBlocks(blockType in blocks ? blocks[blockType] : blockType);
  }
  onKeyDown(event) {
    const {key} = event;
    switch (key) {
      case 'ArrowUp':
      case 'ArrowDown':
        console.dir({...event});
        event.stopPropagation();
        event.preventDefault();

        const methods = {
          ArrowDown: ['nextElementSibling', 'firstElementChild'],
          ArrowUp: ['previousElementSibling', 'lastElementChild'],
        }
        const last = this.dropdown.querySelector('.hover');
        const next = last && last[methods[key][0]] || this.dropdown[methods[key][1]];

        this.dropdown.querySelectorAll('.hover').forEach(el => el.classList.remove('hover'));

        next.classList.add('hover')
        next.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        return false;
      case 'Enter':
        this.convertBlock(this.state.results[0])
        break;
      case 'Backspace':
        if (event.metaKey || !event.target.value) {
          this.editor.delete();
          break;
        }
      default:
        console.log({...event});
        break;
    }
  }
  render(){
    const { attributes, children, node } = this.props;
    return (<div {...attributes} id="SlashSearch">
      <input
        ref={input => (this.field = input)}
        type="text"
        placeholder="try 'blockquote' or 'h2'"
        onClick={slateFocusFix}
        onBlur={e => this.blurHandler(e)}
        onFocus={e=> this.focusHandler(e)}
        onChange={e => this.changeHandler(e)}
        onKeyDown={e => this.onKeyDown(e)}
        />
      <div className="dropdown dropdown_hidden hover" ref={el => (this.dropdown = el)}>
        {this.state.results.map(type => (
        <a id={type}
          onClick={e=> this.convertBlock(e.target.id)}
          onMouseMove={({target}) => {
            target.parentElement.querySelectorAll('.hover').forEach(el => el.classList.remove('hover'));
            target.classList.add('hover');
          }}>
          {this.state.resultKeys[type]}
        </a>))}
      </div>
    </div>);
  }
};

export default (props) => (<SlashSearch {...props} />);
