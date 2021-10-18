import React from 'react'
import PropTypes from 'prop-types'
import { RedocStandalone } from 'redoc'

import docPropTypes from '../../prop-types/doc'
import colors from '../../colors'

const REDOC_OPTIONS = {
  disableSearch: true,
  hideDownloadButton: true,
  lazyRendering: true,
  theme: {
    spacing: {
      sectionHorizontal: 20,
      sectionVertical: 10
    }
  }
}

const SUPPORTED_METHODS = Object.keys(colors).filter(key => colors[key].color)

const changeApiMethodColor = (apiContent) => {
  SUPPORTED_METHODS
    .map(method => ({method, spanElement: apiContent.querySelector(`span[type=${method}]`)}))
    .filter(({spanElement}) => spanElement)
    .forEach(({method, spanElement}) => {
      const currentColor = colors[method];
      spanElement.style.backgroundColor = currentColor.color
      spanElement.style.border = currentColor.border
    })
}

const reduceHeight = (apiContent) => {
  const lastSection = [...apiContent.querySelectorAll('[data-section-id]')].pop()
  lastSection.style.minHeight = 'unset'
}

const adjustSection = (section) => {
  const sectionTitle = section.querySelector("h1")
  if(sectionTitle) {
    sectionTitle.remove()
  }
}

const patchRedoc = () => {
  const redocMenu = document.querySelector(".menu-content")
  if (redocMenu) {
    const apiContent = redocMenu.parentElement.querySelector(".api-content")
    changeApiMethodColor(apiContent)
    reduceHeight(apiContent)
    apiContent.style.width = '100%'
    apiContent.children[0].remove()
    apiContent.nextSibling.style.width = 'calc(100% * 0.4)'
    apiContent.querySelectorAll('div[id^=tag]').forEach(adjustSection)
    redocMenu.remove()
  }
}

const ViewOnlyMode = ({doc, oas}) => {
  const path = Object.keys(oas.paths).find(key => key === doc.swagger.path)

  const oasObject = {
    ...oas,
    components: [],
    info: {},
    security: [],
    paths: {
      [path]: {
        [doc.api.method]: oas.paths[path][doc.api.method]
      }
    }
  }

  return <RedocStandalone spec={oasObject} onLoaded={patchRedoc} options={REDOC_OPTIONS} />
}

ViewOnlyMode.propTypes = {
  doc: PropTypes.shape(docPropTypes).isRequired,
  oas: PropTypes.shape({
    paths: PropTypes.shape({})
  }),
}

ViewOnlyMode.defaultProps = {
  oas: {
    paths: []
  }
}

export default ViewOnlyMode
