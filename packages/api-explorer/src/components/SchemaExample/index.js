import React, {PureComponent} from 'react';
import ReactJson from 'react-json-view'
import PropTypes from 'prop-types';
import jsf from 'json-schema-faker'
import {equals} from "ramda";

import colors from "../../colors";

const styles = {
  padding: '20px 10px',
  backgroundColor: colors.jsonViewerBackground,
  fontSize: '12px',
  overflow: 'visible',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all'
}

class SchemaExample extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      schema: {}
    }
  }

  static getDerivedStateFromProps (props, state) {
    const {schema} = props
    if (!equals(schema, state.schema)) {
      console.log(jsf.generate(schema))
      return {
        schema: jsf.generate(schema)
      }
    }
    return null
  }

  render() {
    const {schema} = this.state
    return (
      <ReactJson
        src={schema}
        collapsed={1}
        collapseStringsAfterLength={100}
        enableClipboard={false}
        name={null}
        displayDataTypes={false}
        displayObjectSize={false}
        style={styles}
      />
    );
  }
}

SchemaExample.propTypes = {};

export default SchemaExample;
