import React, {useEffect} from 'react'
import PropTypes from 'prop-types'

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

const REDOC_CONTAINER_ID = 'redoc-container'

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

const patchRedoc = () => {
  const redocMenu = document.querySelector(".menu-content")
  if (redocMenu) {
    const apiContent = redocMenu.parentElement.querySelector(".api-content")
    changeApiMethodColor(apiContent)
    reduceHeight(apiContent)
    apiContent.style.width = '100%'
    apiContent.children[0].remove()
    apiContent.children[0].remove()
    apiContent.nextSibling.style.width = 'calc(100% * 0.4)'
    redocMenu.remove()
  }
}

const ViewOnlyMode = ({doc, oas}) => {
  const path = Object.keys(oas.paths).find(key => key === doc.swagger.path)
  const containerId = `${REDOC_CONTAINER_ID}-${path}-${doc.api.method}`

  const oasObject = {
    ...oas,
    info: {},
    paths: {
      [path]: {
        [doc.api.method]: oas.paths[path][doc.api.method]
      }
    }
  }


  useEffect(() => {
    // eslint-disable-next-line
    Redoc.init(oasObject, REDOC_OPTIONS, document.getElementById(containerId), patchRedoc)
  })

  return <div id={containerId} />
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
