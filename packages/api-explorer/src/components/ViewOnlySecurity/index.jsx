import React from 'react'
import PropTypes from 'prop-types'
import { RedocStandalone } from 'redoc'

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

const patchRedoc = () => {
  const redocMenu = document.querySelector(".menu-content")
  if (redocMenu) {
    const parentElement = redocMenu.parentElement;
    parentElement.style.display = 'inherit'
    const apiContent = parentElement.querySelector(".api-content")
    apiContent.style.width = '100%'
    apiContent.nextSibling.remove()
    apiContent.children[0].remove()
    apiContent.children[0].style.minHeight = 'fit-content'
    redocMenu.remove()
  }
}

const ViewOnlySecurity = ({ components }) => {

  const oasObject = {
    components,
    info: {},
    openapi: "3.0.0",
    paths: {},
    security: [],
    servers: [],
    tags: [],
    user: {}
  }

  return <RedocStandalone spec={oasObject} onLoaded={patchRedoc} options={REDOC_OPTIONS} />
};

ViewOnlySecurity.propTypes = {
  components: PropTypes.shape({})
};

ViewOnlySecurity.defaultProps = {
  components: {}
};

export default ViewOnlySecurity;
