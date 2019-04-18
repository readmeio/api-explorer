import React from 'react'
import PropTypes from 'prop-types'

export default function ContentWithTitle({title, subheader, content}) {
    return(
        <div style={{display: 'grid', gridGap: '8px'}}>
        <div style={{fontSize: '18px', color: '#fff'}}>
          {title}
        </div>
        <div>{subheader}</div>
        <div style={{border: '2px solid #fff'}}>
          {content}
        </div>
        <div style={{height: 1, background: 'rgba(255,255,255,0.5)', margin: 8}} />
      </div>
    )
}

ContentWithTitle.propTypes = {
    title: PropTypes.string,
    subheader: PropTypes.node,
    content: PropTypes.node
}