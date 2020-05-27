/* eslint-disable react/prop-types */
/* eslint-disable react/require-default-props */
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
      <div style={{display: 'grid', gridGap: '8px', gridTemplateColumns: '100%', gridTemplateRows: 'min-content', minWidth: 0}}>
        {
          title ?
            <div style={titleStyle}>
              {title}
            </div> : null
        }
        <div>{subheader}</div>
        <div style={showBorder ? {border: `2px solid ${colors.borderContent}`} : {}}>
          {content}
        </div>
        {showDivider ? <div style={{height: 1, background: colors.divider, margin: 0, marginTop: 5, opacity: 0.2}} /> : null}
      </div>
    )
}

ContentWithTitle.propTypes = {
    title: PropTypes.node,
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
}
