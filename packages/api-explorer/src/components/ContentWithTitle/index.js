import React from 'react'
import PropTypes from 'prop-types'

export default function ContentWithTitle({
  title, 
  subheader, 
  content, 
  showDivider, 
  theme, 
  showBorder,
  titleUpperCase,
  titleWithBorder
}) {
    const style = {
      light: {
        title: '#fff',
        borderContent: '#fff',
        divider: 'rgba(255,255,255,0.5)'
      },
      dark: {
        title: '#aeaeae',
        borderContent: '#000',
        divider: '#ddd'
      }
    }
    const colors = style[theme]
    const titleStyle = {
      fontSize: '18px', 
      color: colors.title, 
      ...titleUpperCase?{textTransform: 'uppercase', borderBottom: `1px solid ${colors.divider}`} : {},
      fontWeight: 'bold'
    }
    return(
      <div style={{display: 'grid', gridGap: '8px'}}>
        <div style={titleStyle}>
          {title}
        </div>
        <div>{subheader}</div>
        <div style={showBorder ? {border: `2px solid ${colors.borderContent}`} : {}}>
          {content}
        </div>
        {showDivider ? <div style={{height: 1, background: colors.divider, margin: 8}} /> : null}
      </div>
    )
}

ContentWithTitle.propTypes = {
    title: PropTypes.string,
    subheader: PropTypes.node,
    content: PropTypes.node,
    showDivider: PropTypes.bool,
    theme: PropTypes.oneOf(['light', 'dark']),
    showBorder: PropTypes.bool,
    titleUpperCase: PropTypes.bool
}
ContentWithTitle.defaultProps = {
  showDivider: true,
  theme: 'light',
  showBorder: true,
  titleUpperCase: false,
  titleWithBorder: false
}